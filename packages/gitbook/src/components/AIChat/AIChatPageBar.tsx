'use client';

import { readStreamableValue } from 'ai/rsc';
import * as React from 'react';

import { useAIChatController, useAIConfig } from '../AI';
import { useCurrentContent } from '../hooks/useCurrentContent';
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
    const [hasText, setHasText] = React.useState(false);
    // The card's height assumes a one-line input, so the suggestions give way once the visitor types.
    const showSuggestions = expanded && !hasText;

    const configuredSuggestions = config.suggestions?.length ? config.suggestions : null;
    const [recommended, setRecommended] = React.useState<string[] | null>(null);

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
                suggestions: configuredSuggestions ?? recommended ?? undefined,
            }).slice(0, SUGGESTIONS_COUNT),
        [language, configuredSuggestions, recommended]
    );
    const typedSuggestion = useTypewriter({ texts: suggestions, enabled: !expanded && ready });

    const ask = (message: string) => {
        trackEvent({ type: 'ask_trigger_click', trigger: 'page' });
        setExpanded(false);
        chatController.open('page');
        chatController.postMessage({ message });
    };

    return (
        // z-30 sits above page content (cards, tables and code blocks go up to z-20) and below sheets and dialogs (z-40).
        <div className="pointer-events-none sticky bottom-4 z-30 mt-8 flex justify-center chat-open:hidden print:hidden">
            <div
                className={tcls(
                    'pointer-events-auto relative max-w-full transition-[width] duration-300 ease-out motion-reduce:transition-none',
                    expanded ? 'w-[42rem]' : 'w-[28rem]'
                )}
            >
                {showSuggestions ? (
                    // The input stays in flow on top of the card, so focusing it never moves it; pb-13 leaves its room.
                    <div className="pb-13 absolute -inset-x-2 -bottom-2 flex flex-col border border-tint bg-tint-base p-2 shadow-lg rounded-corners:rounded-[1.25rem] circular-corners:rounded-[1.75rem]">
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
                    rows={1}
                    label={tString(
                        language,
                        'ai_chat_ask',
                        config.assistantName ?? getAIChatName(language, config.trademark)
                    )}
                    placeholder={
                        expanded || !ready
                            ? tString(language, 'ai_chat_input_placeholder')
                            : typedSuggestion
                    }
                    maxLength={2048}
                    keyboardShortcut={false}
                    submitButton={{
                        icon: 'arrow-up',
                        label: tString(language, 'send'),
                        iconOnly: true,
                        className: 'ml-auto -my-1 -mr-1.5',
                    }}
                    onValueChange={(value) => setHasText(value.length > 0)}
                    onKeyDown={(event) => {
                        // Shift+Enter already adds a line in a textarea; Cmd/Ctrl+Enter would otherwise submit.
                        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                            event.preventDefault();
                            const field = event.currentTarget;
                            const end = field.value.length;
                            field.setRangeText(
                                '\n',
                                field.selectionStart ?? end,
                                field.selectionEnd ?? end,
                                'end'
                            );
                            // Lets React's onChange see the edit, so the value and the height stay in sync.
                            field.dispatchEvent(new Event('input', { bubbles: true }));
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
                        // Keeps the one-line pill layout: textarea and send button side by side.
                        'flex-row items-end bg-tint-base/9 px-3 py-2 text-sm circular-corners:rounded-3xl contrast-more:bg-tint-base',
                        showSuggestions ? null : 'shadow-lg backdrop-blur-lg'
                    )}
                />
            </div>
        </div>
    );
}

function useTypewriter({ texts, enabled }: { texts: string[]; enabled: boolean }) {
    const [text, setText] = React.useState('');

    React.useEffect(() => {
        if (!enabled || texts.length === 0) {
            return;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setText(texts[0]!);
            return;
        }

        let index = 0;
        let length = 0;
        let erasing = false;
        let timeout: ReturnType<typeof setTimeout>;

        const tick = () => {
            const current = texts[index % texts.length]!;
            length += erasing ? -1 : 1;
            setText(current.slice(0, length));

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

        setText('');
        timeout = setTimeout(tick, 600);
        return () => clearTimeout(timeout);
    }, [texts, enabled]);

    return text;
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
