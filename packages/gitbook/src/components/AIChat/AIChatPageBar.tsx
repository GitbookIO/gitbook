'use client';

import { readStreamableValue } from 'ai/rsc';
import { useReducedMotion } from 'motion/react';
import * as React from 'react';

import { useAIChatController, useAIConfig } from '../AI';
import { useCurrentContent } from '../hooks/useCurrentContent';
import { useInViewportListener } from '../hooks/useInViewportListener';
import { useTrackEvent } from '../Insights';
import { Button } from '../primitives';
import { Input } from '../primitives/Input';
import { streamRecommendedQuestions } from '../Search/server-actions';
import { getAIChatName } from './AIChat';
import { getSuggestedQuestions } from './AIChatSuggestedQuestions';
import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';

const SUGGESTIONS_COUNT = 3;

// Per space, for the whole session, so navigating between pages doesn't refetch.
const recommendedQuestionsCache = new Map<string, Promise<string[]>>();

export function AIChatPageBar() {
    const language = useLanguage();
    const config = useAIConfig();
    const { siteSpaceId } = useCurrentContent();
    const chatController = useAIChatController();
    const trackEvent = useTrackEvent();
    const [expanded, setExpanded] = React.useState(false);
    const [value, setValue] = React.useState('');
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    // The rest marks where the bar settles at the end of the page: until it scrolls into view, the bar is stuck.
    const restRef = React.useRef<HTMLDivElement>(null);
    const [stuck, setStuck] = React.useState(false);
    useInViewportListener(restRef, (isIntersecting) => setStuck(!isIntersecting));
    // The card's height assumes a one-line input, so the suggestions give way once the visitor types.
    const showSuggestions = expanded && !value;

    const configuredSuggestions = config.suggestions?.length ? config.suggestions : undefined;
    const [recommended, setRecommended] = React.useState<string[]>();

    React.useEffect(() => {
        if (configuredSuggestions || !siteSpaceId) {
            return;
        }
        let cancelled = false;
        fetchRecommendedQuestions(siteSpaceId).then((questions) => {
            if (!cancelled) {
                setRecommended(questions);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [configuredSuggestions, siteSpaceId]);

    const ready = Boolean(configuredSuggestions || recommended || !siteSpaceId);
    const suggestions = React.useMemo(
        () =>
            getSuggestedQuestions({
                language,
                suggestions: configuredSuggestions ?? recommended,
            }).slice(0, SUGGESTIONS_COUNT),
        [language, configuredSuggestions, recommended]
    );
    const typing = !expanded && ready;
    useTypewriter({ ref: inputRef, texts: suggestions, enabled: typing });

    const ask = (message: string) => {
        trackEvent({ type: 'ask_trigger_click', trigger: 'page' });
        setValue('');
        setExpanded(false);
        chatController.open('page');
        chatController.postMessage({ message });
    };

    return (
        <>
            {/* z-30 sits above page content (cards, tables and code blocks go up to z-20) and below sheets and dialogs (z-40). */}
            <div
                className={tcls(
                    'sticky bottom-6 z-30 mx-auto mt-8 max-w-full transition-[width] duration-300 ease-out motion-reduce:transition-none chat-open:hidden print:hidden',
                    // Mobile browsers already inset the viewport's bottom edge for their own toolbar.
                    'max-lg:bottom-(--bar-bottom) max-lg:[--bar-bottom:max(env(safe-area-inset-bottom),0.75rem)]',
                    expanded ? 'w-[42rem]' : 'w-[28rem]'
                )}
            >
                {/* On small screens the page would show all around a stuck bar, so a strip of its background sits behind it. */}
                {stuck ? (
                    <div className="site-background -bottom-(--bar-bottom) mask-t-from-[calc(100%-1.5rem)] animate-fade-in absolute -top-8 left-1/2 -z-10 w-screen -translate-x-1/2 lg:hidden" />
                ) : null}
                {showSuggestions ? (
                    // The input stays in flow on top of the card, so focusing it never moves it; the bottom padding leaves its room.
                    <div className="absolute -inset-x-2 -bottom-2 flex flex-col border border-tint bg-tint-base p-2 pb-16 shadow-lg rounded-corners:rounded-[1.25rem] circular-corners:rounded-[1.75rem]">
                        {suggestions.map((question, index) => (
                            <Button
                                key={question}
                                truncate={false}
                                variant="blank"
                                size="small"
                                className="animate-blur-in-slow w-full"
                                style={{ animationDelay: `${index * 50}ms` }}
                                // Keep the input focused so the bar doesn't collapse before the click lands.
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => ask(question)}
                            >
                                {question}
                            </Button>
                        ))}
                    </div>
                ) : null}
                <Input
                    name="ai-page-bar-input"
                    multiline
                    resize
                    sizing="large"
                    rows={1}
                    label={tString(
                        language,
                        'ai_chat_ask',
                        config.assistantName ?? getAIChatName(language, config.trademark)
                    )}
                    ref={inputRef}
                    // While typing, useTypewriter writes the placeholder itself.
                    placeholder={typing ? '' : tString(language, 'ai_chat_input_placeholder')}
                    maxLength={2048}
                    keyboardShortcut={false}
                    value={value}
                    onValueChange={setValue}
                    onKeyDown={(event) => {
                        // Shift+Enter already adds a line in a textarea; Cmd/Ctrl+Enter would otherwise submit.
                        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                            event.preventDefault();
                            const field = event.currentTarget;
                            field.setRangeText(
                                '\n',
                                field.selectionStart,
                                field.selectionEnd,
                                'end'
                            );
                            setValue(field.value);
                        }
                    }}
                    onFocus={() => setExpanded(true)}
                    onBlur={(event) => {
                        if (!event.currentTarget.value) {
                            setExpanded(false);
                        }
                    }}
                    onSubmit={ask}
                    className={tcls(
                        // The send button is overlaid, so the textarea spans the full width and scrolls at the right edge.
                        // text-base because iOS zooms the page when focusing a field with text under 16px.
                        'bg-tint-base/9 pl-4 text-base contrast-more:bg-tint-base [&_textarea]:max-h-32 [&_textarea]:pr-12',
                        // The larger shadow would be cut off at the bottom edge of a small screen.
                        showSuggestions ? null : 'shadow-lg backdrop-blur-lg max-lg:shadow-sm'
                    )}
                />
                <Button
                    variant="primary"
                    size="xsmall"
                    iconOnly
                    icon="arrow-up"
                    label={tString(language, 'send')}
                    disabled={!value.trim()}
                    onClick={() => ask(value)}
                    className="bottom-2.25 right-2.25 absolute p-1.5"
                />
            </div>
            <div ref={restRef} />
        </>
    );
}

// Writes the placeholder straight to the field: a state update per tick would re-render the whole bar.
function useTypewriter({
    ref,
    texts,
    enabled,
}: {
    ref: React.RefObject<HTMLTextAreaElement | null>;
    texts: string[];
    enabled: boolean;
}) {
    const reduceMotion = useReducedMotion();

    React.useEffect(() => {
        const field = ref.current;
        if (!enabled || !field) {
            return;
        }
        if (reduceMotion) {
            field.placeholder = fitPlaceholder(field, texts[0]!);
            return;
        }

        let index = 0;
        let length = 0;
        let erasing = false;
        let current = '';
        let timeout: ReturnType<typeof setTimeout>;

        const tick = () => {
            if (length === 0) {
                current = fitPlaceholder(field, texts[index % texts.length]!);
            }
            length += erasing ? -1 : 1;
            field.placeholder = current.slice(0, length);

            let delay = erasing ? 20 : 45;
            if (!erasing && length >= current.length) {
                erasing = true;
                delay = 2500;
            } else if (erasing && length <= 0) {
                erasing = false;
                index += 1;
                delay = 400;
            }
            timeout = setTimeout(tick, delay);
        };

        field.placeholder = '';
        timeout = setTimeout(tick, 600);
        return () => clearTimeout(timeout);
    }, [ref, texts, enabled, reduceMotion]);
}

// A placeholder wider than the field wraps onto a line the one-row field hides, so it is cut to fit.
function fitPlaceholder(field: HTMLTextAreaElement, text: string): string {
    const context = document.createElement('canvas').getContext('2d');
    if (!context) {
        return text;
    }
    const style = getComputedStyle(field);
    context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    // 1px of slack, since canvas and layout can round text widths differently.
    const width =
        field.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 1;
    const fits = (candidate: string) => context.measureText(candidate).width <= width;
    if (fits(text)) {
        return text;
    }

    let end = text.length - 1;
    while (end > 0 && !fits(`${text.slice(0, end).trimEnd()}…`)) {
        end -= 1;
    }
    return `${text.slice(0, end).trimEnd()}…`;
}

function fetchRecommendedQuestions(siteSpaceId: string): Promise<string[]> {
    const cached = recommendedQuestionsCache.get(siteSpaceId);
    if (cached) {
        return cached;
    }

    const promise = (async () => {
        const questions = new Set<string>();
        const response = await streamRecommendedQuestions({ siteSpaceId });
        for await (const entry of readStreamableValue(response.stream)) {
            if (entry) {
                questions.add(entry.question);
            }
            if (questions.size >= SUGGESTIONS_COUNT) {
                break;
            }
        }
        return Array.from(questions);
    })().catch(() => []);

    recommendedQuestionsCache.set(siteSpaceId, promise);
    return promise;
}
