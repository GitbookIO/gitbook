'use client';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React, { type ReactNode } from 'react';
import { Button, type ButtonProps } from './Button';
import { KeyboardShortcut } from './KeyboardShortcut';

export type InputProps = {
    label: string;
    leading?: IconName | React.ReactNode;
    trailing?: React.ReactNode;
    sizing?: 'medium' | 'large'; // The `size` prop is already taken by the HTML input element.
    containerRef?: React.RefObject<HTMLDivElement | null>;
    /**
     * A submit button, shown to the right of the input.
     */
    submitButton?: boolean | ButtonProps;
    /**
     * A message to be shown to the right of the input when the value has been submitted.
     */
    submitMessage?: string | ReactNode;
    /**
     * A clear button, shown to the left of the input.
     */
    clearButton?: boolean | ButtonProps;
    /**
     * A keyboard shortcut, shown to the right of the input.
     */
    keyboardShortcut?: boolean | ReactNode;

    onSubmit?: (value: string | number | readonly string[] | undefined) => void;
    resize?: boolean;
} & (
    | (React.InputHTMLAttributes<HTMLInputElement> & { multiline?: false })
    | (React.TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true })
);

type HybridInputElement = HTMLInputElement & HTMLTextAreaElement;

const SIZE_CLASSES = {
    medium: {
        container: 'p-2 circular-corners:rounded-3xl rounded-corners:rounded-lg',
        input: '-m-2 p-2',
    },
    large: {
        container: 'p-2 circular-corners:rounded-3xl rounded-corners:rounded-xl',
        input: '-m-2 p-3',
    },
};

/**
 * Input base component with core functionality and shared styles.
 */
export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
    (props, passedRef) => {
        const {
            multiline,
            value: initialValue,
            sizing = 'medium',
            leading,
            trailing,
            className,
            clearButton,
            submitButton,
            submitMessage,
            label,
            'aria-label': ariaLabel,
            'aria-busy': ariaBusy,
            placeholder,
            keyboardShortcut,
            disabled,
            onSubmit,
            onChange,
            onKeyDown,
            containerRef,
            maxLength,
            minLength,
            resize = false,
            ...rest
        } = props;

        const [value, setValue] = React.useState(initialValue ?? '');
        const [submitted, setSubmitted] = React.useState(false);
        const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
        const ref = passedRef ?? inputRef;

        const language = useLanguage();
        const hasValue = value.toString().trim();
        const hasValidValue =
            hasValue &&
            (maxLength ? value.toString().length <= maxLength : true) &&
            (minLength ? value.toString().length >= minLength : true);

        React.useEffect(() => {
            setValue(initialValue ?? '');
        }, [initialValue]);

        const handleChange = (event: React.ChangeEvent<HybridInputElement>) => {
            setValue(event.target.value);
            onChange?.(event);

            // Auto-resize
            if (multiline && resize && 'current' in ref && ref.current) {
                ref.current.style.height = 'auto';
                ref.current.style.height = `${ref.current.scrollHeight}px`;
            }
        };

        const handleClick = () => {
            if (!('current' in ref)) return;

            const element = ref.current;
            if (element) {
                element.focus();
            }
        };

        const handleSubmit = () => {
            if (hasValue && onSubmit) {
                onSubmit(value);
                setSubmitted(true);
            }
        };

        const input = (
            <input
                className={tcls(
                    'peer -m-2 max-h-64 grow resize-none text-left outline-none placeholder:text-tint/8 aria-busy:cursor-progress',
                    SIZE_CLASSES[sizing].input
                )}
                type="text"
                ref={ref as React.Ref<HTMLInputElement>}
                value={value}
                size={1} // This will make the input have the smallest possible width (1 character) so we can grow it with flexbox
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && value.toString().trim()) {
                        event.preventDefault();
                        handleSubmit();
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        event.currentTarget.blur();
                    }
                    onKeyDown?.(event as React.KeyboardEvent<HybridInputElement>);
                }}
                aria-busy={ariaBusy}
                onChange={handleChange}
                aria-label={ariaLabel ?? label}
                placeholder={placeholder ? placeholder : label}
                disabled={disabled}
                maxLength={maxLength}
                minLength={minLength}
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
            />
        );

        return (
            <div
                className={tcls(
                    'group/input relative flex min-h-min gap-2 overflow-hidden border border-tint bg-tint-base shadow-tint/6 ring-primary-hover transition-all dark:shadow-tint-1',
                    'depth-subtle:focus-within:-translate-y-px depth-subtle:hover:-translate-y-px depth-subtle:shadow-sm depth-subtle:focus-within:shadow-lg',
                    disabled
                        ? 'cursor-not-allowed border-tint-subtle bg-tint-subtle'
                        : 'focus-within:border-primary-hover focus-within:shadow-primary-subtle focus-within:ring-2 hover:cursor-text hover:border-tint-hover focus-within:hover:border-primary-hover',
                    multiline ? 'flex-col' : 'flex-row',
                    ariaBusy ? 'cursor-progress' : '',
                    SIZE_CLASSES[sizing].container,
                    className
                )}
                onClick={handleClick}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        handleClick();
                    }
                }}
                ref={containerRef}
            >
                <div
                    className={tcls('flex grow gap-2', multiline ? 'items-start' : 'items-center')}
                >
                    {leading ? (
                        typeof leading === 'string' ? (
                            <Icon
                                icon={leading as IconName}
                                className={tcls(
                                    'ml-1 size-4 shrink-0 text-tint',
                                    multiline ? 'my-1.5' : 'my-0.5',
                                    clearButton && hasValue ? 'group-focus-within/input:hidden' : ''
                                )}
                            />
                        ) : (
                            leading
                        )
                    ) : null}
                    {clearButton ? (
                        <Button
                            variant="blank"
                            size="medium"
                            label={tString(language, 'clear')}
                            iconOnly
                            icon="circle-xmark"
                            className={tcls(
                                '-m-1 -ml-0.5 hidden shrink-0 animate-fade-in p-1.5 text-tint',
                                multiline ? 'mt-0.5' : '',
                                hasValue ? 'group-focus-within/input:flex' : ''
                            )}
                            onClick={() => {
                                handleChange({
                                    target: {
                                        value: '',
                                    },
                                } as React.ChangeEvent<HybridInputElement>);
                            }}
                        />
                    ) : null}
                    {multiline ? <textarea {...input.props} /> : input}

                    <div className={multiline ? 'absolute top-2.5 right-2.5' : ''}>
                        {keyboardShortcut !== false ? (
                            typeof keyboardShortcut === 'object' ? (
                                keyboardShortcut
                            ) : onSubmit && !submitted && hasValue ? (
                                <KeyboardShortcut
                                    keys={['enter']}
                                    className="hidden bg-tint-base group-focus-within/input:flex"
                                />
                            ) : null
                        ) : null}
                    </div>
                </div>
                {trailing || submitButton || maxLength ? (
                    <div className="flex items-center gap-2 empty:hidden">
                        {trailing ? trailing : null}
                        {maxLength && !submitted && value.toString().length > maxLength * 0.8 ? (
                            <span
                                className={tcls(
                                    'animate-fade-in text-xs',
                                    value.toString().length >= maxLength
                                        ? 'text-danger-subtle'
                                        : 'text-tint-subtle'
                                )}
                            >
                                {value.toString().length} / {maxLength}
                            </span>
                        ) : null}
                        {submitted ? (
                            submitMessage ? (
                                typeof submitMessage === 'string' ? (
                                    <div className="ml-auto flex animate-fade-in items-center gap-1 p-1.5 text-success-subtle">
                                        <Icon icon="check-circle" className="size-4" />
                                        {submitMessage}
                                    </div>
                                ) : (
                                    submitMessage
                                )
                            ) : null
                        ) : submitButton ? (
                            <Button
                                variant="primary"
                                size="medium"
                                label={tString(language, 'submit')}
                                onClick={handleSubmit}
                                icon={multiline ? undefined : 'arrow-right'}
                                disabled={disabled || !hasValidValue}
                                iconOnly={!multiline}
                                className="ml-auto"
                                {...(typeof submitButton === 'object'
                                    ? { ...submitButton }
                                    : undefined)}
                            />
                        ) : null}
                    </div>
                ) : null}
            </div>
        );
    }
);
