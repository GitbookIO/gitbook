import { t, tString, useLanguage } from '@/intl/client';
import { Icon } from '@gitbook/icons';
import { useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAIChatState } from '../AI/useAIChat';
import { HoverCard, HoverCardRoot, HoverCardTrigger } from '../primitives';
import { Input } from '../primitives/Input';

export function AIChatInput(props: {
    disabled?: boolean;
    /**
     * When true, the input is disabled
     */
    loading: boolean;
    onSubmit: (value: string) => void;
}) {
    const { onSubmit, disabled, loading } = props;

    const language = useLanguage();
    const chat = useAIChatState();

    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (chat.opened && !disabled && !loading) {
            // Add a small delay to ensure the input is rendered before focusing
            // This fixes inconsistent focus behaviour across browsers
            const timeout = setTimeout(() => {
                inputRef.current?.focus();
            }, 150);

            return () => clearTimeout(timeout);
        }
    }, [disabled, loading, chat.opened]);

    useHotkeys(
        'mod+i',
        (e) => {
            e.preventDefault();
            inputRef.current?.focus();
        },
        {
            enableOnFormTags: true,
        }
    );

    return (
        <Input
            data-testid="ai-chat-input"
            name="ai-chat-input"
            multiline
            resize
            sizing="large"
            label="Assistant chat input"
            placeholder={tString(language, 'ai_chat_input_placeholder')}
            onSubmit={(val) => onSubmit(val as string)}
            submitButton={{
                label: tString(language, 'send'),
            }}
            className="animate-blur-in-slow bg-tint-base/9 backdrop-blur-lg contrast-more:bg-tint-base"
            rows={1}
            keyboardShortcut={
                !disabled && !loading
                    ? {
                          keys: ['mod', 'i'],
                          className: 'bg-tint-base group-focus-within/input:hidden',
                      }
                    : undefined
            }
            disabled={disabled || loading}
            aria-busy={loading}
            ref={inputRef}
            trailing={
                <HoverCardRoot openDelay={500}>
                    <HoverCard
                        className="max-w-xs bg-tint p-2 text-sm text-tint"
                        arrow={{ className: 'fill-tint-3' }}
                    >
                        <div className="flex flex-col gap-3 p-2">
                            <p className="font-semibold">
                                {t(language, 'ai_chat_context_description')}
                            </p>
                            <ul className="flex flex-col gap-2">
                                <li className="flex items-center gap-2">
                                    <Icon icon="memo" className="size-3.5 opacity-7" />
                                    {t(language, 'ai_chat_context_pages_youve_read')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Icon icon="user" className="size-3.5 opacity-7" />
                                    {t(language, 'ai_chat_context_info_provided_by_the_site')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <Icon icon="message-question" className="size-3.5 opacity-7" />
                                    {t(language, 'ai_chat_context_previous_messages')}
                                </li>
                            </ul>
                            <p>{t(language, 'ai_chat_context_disclaimer')}</p>
                        </div>
                    </HoverCard>
                    <HoverCardTrigger>
                        {/* Negative margin to compensate for Input's padding, so the badge appears flush with the cursor */}
                        <div className="-ml-1 flex cursor-help items-center gap-1 circular-corners:rounded-2xl rounded-corners:rounded-md px-2.5 py-1.5 text-tint/7 text-xs transition-all hover:bg-tint">
                            <span className="-ml-1 circular-corners:rounded-2xl rounded-corners:rounded-sm bg-tint-11/7 px-1 py-0.5 font-mono font-semibold text-[0.65rem] text-contrast-tint-11 leading-none">
                                {t(language, 'ai_chat_context_badge')}
                            </span>{' '}
                            <span className="leading-none">
                                {t(language, 'ai_chat_context_title')}
                            </span>
                            <Icon icon="question-circle" className="size-3 shrink-0" />
                        </div>
                    </HoverCardTrigger>
                </HoverCardRoot>
            }
        />
    );
}
