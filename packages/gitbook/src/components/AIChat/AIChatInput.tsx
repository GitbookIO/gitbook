import { t, tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import { useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Button, HoverCard, HoverCardRoot, HoverCardTrigger } from '../primitives';
import { KeyboardShortcut } from '../primitives/KeyboardShortcut';

export function AIChatInput(props: {
    value: string;
    disabled?: boolean;
    /**
     * When true, the input is disabled
     */
    loading: boolean;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}) {
    const { value, onChange, onSubmit, disabled, loading } = props;

    const language = useLanguage();

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = event.currentTarget;
        onChange(textarea.value);

        // Auto-resize
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    useEffect(() => {
        if (!disabled && !loading) {
            // Add a small delay to ensure the input is rendered before focusing
            // This fixes inconsistent focus behaviour across browsers
            const timeout = setTimeout(() => {
                inputRef.current?.focus();
            }, 150);

            return () => clearTimeout(timeout);
        }
    }, [disabled, loading]);

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
        <div className="depth-subtle:has-[textarea:focus]:-translate-y-px relative flex flex-col overflow-hidden circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint-base/9 depth-subtle:shadow-sm shadow-tint/6 ring-1 ring-tint-subtle backdrop-blur-lg transition-all depth-subtle:has-[textarea:focus]:shadow-lg has-[textarea:focus]:shadow-primary-subtle has-[textarea:focus]:ring-2 has-[textarea:focus]:ring-primary-hover contrast-more:bg-tint-base dark:shadow-tint-1">
            <textarea
                ref={inputRef}
                disabled={disabled || loading}
                data-loading={loading}
                data-testid="ai-chat-input"
                className={tcls(
                    'resize-none',
                    'focus:outline-hidden',
                    'focus:ring-0',
                    'w-full',
                    'px-3',
                    'py-3',
                    'pb-12',
                    'h-auto',
                    'bg-transparent',
                    'peer',
                    'max-h-64',
                    'placeholder:text-tint/8',
                    'transition-colors',
                    'disabled:bg-tint-subtle',
                    'delay-300',
                    'disabled:delay-0',
                    'disabled:cursor-not-allowed',
                    'data-[loading=true]:cursor-progress',
                    'data-[loading=true]:opacity-50'
                )}
                value={value}
                rows={1}
                placeholder={tString(language, 'ai_chat_input_placeholder')}
                onChange={handleInput}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        event.currentTarget.blur();
                        return;
                    }

                    if (event.key === 'Enter' && !event.shiftKey && value.trim()) {
                        event.preventDefault();
                        event.currentTarget.style.height = 'auto';
                        onSubmit(value);
                    }
                }}
            />
            {!disabled ? (
                <div className="absolute top-2.5 right-3 animate-[fadeIn_0.2s_0.5s_ease-in-out_both] peer-focus:hidden">
                    <KeyboardShortcut keys={['mod', 'i']} className="bg-tint-base" />
                </div>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-2 py-2">
                <HoverCardRoot>
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
                        <div className="flex cursor-help items-center gap-1 circular-corners:rounded-2xl rounded-corners:rounded-md px-2.5 py-1.5 text-tint/7 text-xs transition-all hover:bg-tint">
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
                <Button
                    label={tString(language, 'send')}
                    size="medium"
                    className="ml-auto"
                    disabled={disabled || !value.trim()}
                    onClick={() => onSubmit(value)}
                />
            </div>
        </div>
    );
}
