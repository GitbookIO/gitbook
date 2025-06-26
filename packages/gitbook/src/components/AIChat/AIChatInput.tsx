import { tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import { useEffect, useRef } from 'react';
import { Button } from '../primitives';
import { Tooltip } from '../primitives/Tooltip';

export function AIChatInput(props: {
    value: string;
    disabled: boolean;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
}) {
    const { value, onChange, onSubmit, disabled } = props;

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = event.currentTarget;
        onChange(textarea.value);

        // Auto-resize
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 300);
    }, [disabled]);

    return (
        <div className="relative flex flex-col overflow-hidden circular-corners:rounded-2xl rounded-corners:rounded-md bg-tint-base/9 ring-1 ring-tint-subtle backdrop-blur-lg transition-all depth-subtle:has-[textarea:focus]:shadow-lg has-[textarea:focus]:ring-2 has-[textarea:focus]:ring-primary-hover contrast-more:bg-tint-base">
            <textarea
                ref={inputRef}
                disabled={disabled}
                className={tcls(
                    'resize-none',
                    'focus:outline-none',
                    'focus:ring-0',
                    'w-full',
                    'px-4',
                    'py-3',
                    'pb-12',
                    'h-auto',
                    'bg-transparent',
                    'max-h-64',
                    'placeholder:text-tint/8',
                    'transition-colors',
                    'disabled:bg-tint-subtle',
                    'delay-300',
                    'disabled:delay-0',
                    'disabled:cursor-progress'
                )}
                value={value}
                rows={1}
                placeholder="Ask, search, or take action..."
                onChange={handleInput}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && value.trim()) {
                        event.preventDefault();
                        event.currentTarget.style.height = 'auto';
                        onSubmit(value);
                    }
                }}
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center px-2 py-2">
                <Tooltip
                    label={
                        <div className="flex flex-col gap-2 p-2">
                            <p>
                                Docs Assistant uses your context to generate answers and perform
                                actions.
                            </p>
                            <ul className="flex flex-col gap-2">
                                <li className="flex items-center gap-2">
                                    <Icon icon="memo" className="size-3.5 opacity-7" />
                                    Pages you've read
                                </li>
                                <li className="flex items-center gap-2">
                                    <Icon icon="user" className="size-3.5 opacity-7" />
                                    Info provided by the site
                                </li>
                                <li className="flex items-center gap-2">
                                    <Icon icon="message-question" className="size-3.5 opacity-7" />
                                    Previous messages
                                </li>
                            </ul>
                        </div>
                    }
                    arrow
                >
                    <span className="flex cursor-help items-center gap-1 circular-corners:rounded-2xl rounded-corners:rounded-md px-2 py-1 text-tint/7 text-xs transition-all hover:bg-tint">
                        <Icon icon="glasses-round" className="size-3.5" /> Based on your context
                    </span>
                </Tooltip>
                <Button
                    label="Send"
                    size="medium"
                    className="ml-auto"
                    disabled={disabled || !value.trim()}
                    onClick={() => onSubmit(value)}
                />
            </div>
        </div>
    );
}
