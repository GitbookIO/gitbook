'use client';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React, { type ReactNode } from 'react';
import { Button, type ButtonProps } from './Button';
import { KeyboardShortcut, type KeyboardShortcutProps } from './KeyboardShortcut';

export type InputProps = {
    label: string;
    tag?: 'div' | 'span';
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
    keyboardShortcut?: boolean | KeyboardShortcutProps;

    onSubmit?: (value: string | number | readonly string[] | undefined) => void;
    resize?: boolean;
} & (
    | (React.InputHTMLAttributes<HTMLInputElement> & { multiline?: false })
    | (React.TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true })
);

type HybridInputElement = HTMLInputElement & HTMLTextAreaElement;

/**
 * Input component with core functionality (submitting, clearing, validating) and shared styles.
 */
export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
    (props, passedRef) => {
        const {
            multiline,
            value: passedValue,
            sizing = 'medium',
            tag = 'div',
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

        const [value, setValue] = React.useState(passedValue ?? '');
        const [submitted, setSubmitted] = React.useState(false);
        const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
        const ref = passedRef ?? inputRef;

        const language = useLanguage();
        const isControlled = 'value' in props;
        const hasValue = value.toString().trim();
        const hasValidValue =
            hasValue &&
            (maxLength ? value.toString().length <= maxLength : true) &&
            (minLength ? value.toString().length >= minLength : true);

        const sizes = {
            medium: {
                container: `${multiline ? 'p-2' : 'px-4 py-2'} gap-2 circular-corners:rounded-3xl rounded-corners:rounded-xl`,
                input: '-m-2 p-2',
                gap: 'gap-2',
            },
            large: {
                container: `${multiline ? 'p-3' : 'px-6 py-3 '} gap-3 circular-corners:rounded-3xl rounded-corners:rounded-xl`,
                input: '-m-3 p-3',
                gap: 'gap-3',
            },
        };

        const handleChange = (event: React.ChangeEvent<HybridInputElement>) => {
            const newValue = event.target.value;
            if (!isControlled) {
                setValue(newValue);
            }
            onChange?.(event);

            // Reset submitted state when user edits the value to allow re-submission
            if (submitted) {
                setSubmitted(false);
            }

            if (multiline && resize && 'current' in ref && ref.current) {
                ref.current.style.height = 'auto';
                ref.current.style.height = `${ref.current.scrollHeight}px`;
            }
        };

        const handleClear = () => {
            if (!('current' in ref) || !ref.current) return;

            const syntheticEvent = {
                target: { value: '' },
                currentTarget: ref.current,
            } as React.ChangeEvent<HybridInputElement>;

            handleChange(syntheticEvent);
        };

        const handleClick = () => {
            if (!('current' in ref)) return;
            ref.current?.focus();
        };

        const handleSubmit = () => {
            if (hasValue && onSubmit) {
                onSubmit(value);
                setSubmitted(true);
                if (!isControlled && 'current' in ref && ref.current) {
                    ref.current.value = '';
                }
            }
        };

        const handleKeyDown = (event: React.KeyboardEvent<HybridInputElement>) => {
            if (event.key === 'Enter' && !event.shiftKey && hasValue) {
                event.preventDefault();
                handleSubmit();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                event.currentTarget.blur();
            }
            onKeyDown?.(event);
        };

        const inputClassName = tcls(
            'peer -m-2 max-h-64 grow resize-none text-left outline-none placeholder:text-tint/8 aria-busy:cursor-progress',
            sizes[sizing].input
        );

        const inputProps = {
            className: inputClassName,
            ref: ref as React.Ref<HTMLInputElement | HTMLTextAreaElement>,
            value: passedValue,
            onKeyDown: handleKeyDown,
            'aria-busy': ariaBusy,
            onChange: handleChange,
            'aria-label': ariaLabel ?? label,
            placeholder: placeholder ?? label,
            disabled: disabled,
            maxLength: maxLength,
            minLength: minLength,
            ...rest,
        };

        const Tag = tag;

        return (
            <Tag
                className={tcls(
                    'group/input relative flex min-h-min overflow-hidden border border-tint bg-tint-base align-middle shadow-tint/6 ring-primary-hover transition-all dark:shadow-tint-1',
                    disabled
                        ? 'cursor-not-allowed border-tint-subtle bg-tint-subtle opacity-7'
                        : [
                              'depth-subtle:focus-within:-translate-y-px depth-subtle:hover:-translate-y-px depth-subtle:shadow-xs',
                              'focus-within:border-primary-hover focus-within:depth-subtle:shadow-lg focus-within:shadow-primary-subtle focus-within:ring-2 hover:cursor-text hover:border-tint-hover depth-subtle:hover:not-focus-within:shadow-md focus-within:hover:border-primary-hover',
                          ],
                    multiline ? 'flex-col' : 'flex-row',
                    ariaBusy ? 'cursor-progress' : '',
                    sizes[sizing].container,
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
                <Tag
                    className={tcls(
                        'flex grow',
                        sizes[sizing].gap,
                        multiline ? 'items-start' : 'items-center'
                    )}
                >
                    {leading ? (
                        <Tag
                            className={tcls(
                                clearButton && hasValue ? 'group-focus-within/input:hidden' : '',
                                multiline ? 'my-1.25' : ''
                            )}
                        >
                            {typeof leading === 'string' ? (
                                <Icon
                                    icon={leading as IconName}
                                    className="size-4 shrink-0 text-tint"
                                />
                            ) : (
                                leading
                            )}
                        </Tag>
                    ) : null}
                    {clearButton ? (
                        <Button
                            variant="blank"
                            size="medium"
                            label={tString(language, 'clear')}
                            iconOnly
                            icon="circle-xmark"
                            onClick={handleClear}
                            {...(typeof clearButton === 'object' ? clearButton : {})}
                            className={tcls(
                                '-mx-1.5 hidden shrink-0 animate-fade-in p-1.5 text-tint',
                                multiline ? '-my-0.25' : '-my-1.5',
                                hasValue ? 'group-focus-within/input:flex' : '',
                                typeof clearButton === 'object' ? clearButton.className : ''
                            )}
                        />
                    ) : null}
                    {multiline ? (
                        <textarea
                            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                        />
                    ) : (
                        <input
                            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
                            type="text"
                            size={1}
                        />
                    )}

                    {keyboardShortcut !== false ? (
                        <Tag
                            className={
                                multiline ? `absolute top-0 right-0 ${sizes[sizing].container}` : ''
                            }
                        >
                            {typeof keyboardShortcut === 'object' ? (
                                <KeyboardShortcut {...keyboardShortcut} />
                            ) : onSubmit && !submitted && hasValue ? (
                                <KeyboardShortcut
                                    keys={['enter']}
                                    className="hidden bg-tint-base group-focus-within/input:flex"
                                />
                            ) : null}
                        </Tag>
                    ) : null}
                </Tag>
                {trailing || submitButton || maxLength ? (
                    <Tag className="flex items-center gap-2 empty:hidden">
                        {trailing}
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
                        {submitted && submitMessage ? (
                            typeof submitMessage === 'string' ? (
                                <Tag className="ml-auto flex animate-fade-in items-center gap-1 p-1.5 text-success-subtle">
                                    <Icon icon="check-circle" className="size-4" />
                                    {submitMessage}
                                </Tag>
                            ) : (
                                submitMessage
                            )
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
                                {...(typeof submitButton === 'object' ? submitButton : {})}
                            />
                        ) : null}
                    </Tag>
                ) : null}
            </Tag>
        );
    }
);
