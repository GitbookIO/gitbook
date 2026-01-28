'use client';

import { tString, useLanguage } from '@/intl/client';
import { tcls } from '@/lib/tailwind';
import { Icon, type IconName } from '@gitbook/icons';
import React, { type ReactNode } from 'react';
import { useControlledState } from '../hooks/useControlledState';
import { Button, type ButtonProps } from './Button';
import { KeyboardShortcut, type KeyboardShortcutProps } from './KeyboardShortcut';

type CustomInputProps = {
    label: string;
    inline?: boolean;
    leading?: IconName | React.ReactNode;
    trailing?: React.ReactNode;
    sizing?: 'small' | 'medium' | 'large'; // The `size` prop is already taken by the HTML input element.
    containerRef?: React.RefObject<HTMLDivElement | null>;
    containerStyle?: React.CSSProperties;
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
    /**
     * Callback invoked when the user submits the input by pressing Enter.
     * Only called if the input has a non-empty value.
     */
    onSubmit?: (value: string) => void;
    /**
     * Controlled value of the input. When provided, the input becomes a controlled component.
     */
    value?: string;
    /**
     * Callback invoked whenever the input value changes.
     * Used to update the parent component's state in controlled mode.
     */
    onValueChange?: (value: string) => void;
    /**
     * When true, automatically resizes the textarea vertically to fit its content.
     * Only applies when multiline is true.
     */
    resize?: boolean;
};

export type InputProps = CustomInputProps &
    (
        | ({ multiline?: false } & Omit<
              React.InputHTMLAttributes<HTMLInputElement>,
              'value' | 'onChange'
          >)
        | ({ multiline: true } & Omit<
              React.TextareaHTMLAttributes<HTMLTextAreaElement>,
              'value' | 'onChange'
          >)
    );

type InputElement = HTMLInputElement | HTMLTextAreaElement;

/**
 * Input component with core functionality (submitting, clearing, validating) and shared styles.
 */
export const Input = React.forwardRef<InputElement, InputProps>((props, passedRef) => {
    const {
        // Custom props
        multiline,
        sizing = 'medium',
        inline = false,
        leading,
        trailing,
        className,
        clearButton,
        submitButton,
        submitMessage,
        label,
        keyboardShortcut,
        onSubmit,
        containerRef,
        containerStyle,
        resize = false,
        // HTML attributes we need to read
        value: passedValue,
        'aria-label': ariaLabel,
        'aria-busy': ariaBusy,
        placeholder,
        disabled,
        onValueChange,
        onKeyDown,
        maxLength,
        minLength,
        // Rest are HTML attributes to pass through
        ...htmlProps
    } = props;

    const [value, setValue] = useControlledState(passedValue, passedValue ?? '', onValueChange);
    const [submitted, setSubmitted] = React.useState(false);
    const [height, setHeight] = React.useState<number>();
    const inputRef = React.useRef<InputElement>(null);
    const ref = (passedRef as React.RefObject<HTMLInputElement | HTMLTextAreaElement>) ?? inputRef;

    const language = useLanguage();
    const hasValue = value.toString().trim().length > 0;
    const hasValidValue =
        hasValue &&
        (maxLength ? value.toString().length <= maxLength : true) &&
        (minLength ? value.toString().length >= minLength : true);

    const sizes = {
        small: {
            container: `${multiline ? 'p-1.5' : 'px-2.5 py-1.5'} text-sm gap-1.5 circular-corners:rounded-3xl rounded-corners:rounded-xl`,
            input: '-m-1.5 p-1.5',
            gap: 'gap-2',
            leading: 'size-text-base',
            trailing: '-my-1 -mr-1.5',
        },
        medium: {
            container: `${multiline ? 'p-2' : 'px-3 py-2'} gap-2 circular-corners:rounded-3xl rounded-corners:rounded-xl`,
            input: '-m-2 p-2',
            gap: 'gap-2',
            leading: 'size-text-lg',
            trailing: '-my-1 -mr-1.5',
        },
        large: {
            container: `${multiline ? 'p-3' : 'px-3.5 py-3 '} gap-3 circular-corners:rounded-3xl rounded-corners:rounded-xl`,
            input: '-m-3 p-3',
            gap: 'gap-3',
            leading: 'size-text-2xl',
            trailing: '-my-2.5 -mr-2.5',
        },
    };

    const handleChange = (event: React.ChangeEvent<InputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);

        // Reset submitted state when user edits the value to allow re-submission
        if (submitted) {
            setSubmitted(false);
        }

        if (multiline && resize && ref.current) {
            // TODO: replace with `field-sizing: content` when more broadly supported. https://caniuse.com/?search=field-sizing
            // Reset the height to auto, then set it to the scroll height. If we don't reset, the height will only ever grow.
            setHeight(ref.current.scrollHeight);
        }
    };

    const handleClear = () => {
        if (!ref.current) return;
        setValue('');
    };

    const handleClick = () => {
        ref.current?.focus();
    };

    const handleSubmit = () => {
        if (hasValue && onSubmit) {
            onSubmit(value);
            setSubmitted(true);
            setValue('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<InputElement>) => {
        onKeyDown?.(event as React.KeyboardEvent<HTMLInputElement & HTMLTextAreaElement>);
        // If the user wants to handle the keydown by itself, we let him do it.
        if (event.defaultPrevented) return;

        if (event.key === 'Enter' && !event.shiftKey && hasValue) {
            event.preventDefault();
            handleSubmit();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            event.currentTarget.blur();
        }
    };

    const inputClassName = tcls(
        'peer -m-2 max-h-64 grow shrink resize-none leading-normal text-left outline-none placeholder:text-tint/8 placeholder-shown:text-ellipsis aria-busy:cursor-progress',
        sizes[sizing].input
    );

    const inputProps = {
        className: inputClassName,
        value: value,
        onKeyDown: handleKeyDown,
        'aria-busy': ariaBusy,
        onChange: handleChange,
        'aria-label': ariaLabel ?? label,
        placeholder: placeholder ?? label,
        disabled: disabled,
        maxLength: maxLength,
        minLength: minLength,
        style: {
            height: multiline && resize && hasValue && height ? `${height}px` : undefined,
        },
    };

    const Tag: React.ElementType = inline ? 'span' : 'div';

    return (
        <Tag
            className={tcls(
                'group/input relative flex min-h-min overflow-hidden border border-tint bg-tint-base align-middle shadow-tint/6 ring-primary-hover transition-all dark:shadow-tint-1',
                disabled
                    ? 'cursor-not-allowed border-tint-subtle bg-tint-subtle opacity-7'
                    : [
                          'depth-subtle:focus-within:-translate-y-px depth-subtle:hover:-translate-y-px depth-subtle:shadow-xs',
                          'focus-within:border-primary-hover focus-within:depth-subtle:shadow-lg focus-within:shadow-primary-subtle focus-within:ring-2 hover:cursor-text hover:border-tint-hover hover:not-focus-within:bg-tint-subtle depth-subtle:hover:not-focus-within:shadow-md focus-within:hover:border-primary-hover',
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
            style={containerStyle}
        >
            <Tag
                className={tcls(
                    'flex shrink grow',
                    sizes[sizing].gap,
                    multiline ? 'items-start' : 'items-center'
                )}
            >
                {leading ? (
                    <Tag
                        className={tcls(
                            clearButton && hasValue ? 'group-focus-within/input:hidden' : '',
                            multiline ? 'h-text-2xl' : '',
                            'flex items-center text-tint'
                        )}
                    >
                        {typeof leading === 'string' ? (
                            <Icon
                                icon={leading as IconName}
                                className={tcls('shrink-0', sizes[sizing].leading)}
                            />
                        ) : (
                            leading
                        )}
                    </Tag>
                ) : null}
                {clearButton ? (
                    <Button
                        variant="blank"
                        size={sizing}
                        label={tString(language, 'clear')}
                        iconOnly
                        icon="circle-xmark"
                        onClick={handleClear}
                        {...(typeof clearButton === 'object' ? clearButton : {})}
                        className={tcls(
                            'hidden shrink-0 animate-fade-in text-tint',
                            hasValue ? 'group-focus-within/input:flex' : '',
                            typeof clearButton === 'object' ? clearButton.className : '',
                            sizing === 'small' ? '-ml-1.75 -my-1 -mr-2 p-1' : '',
                            sizing === 'medium' ? '-ml-2.25 -my-1.5 -mr-2 p-1.5' : '',
                            sizing === 'large' ? '-mx-2 -my-2 p-2' : ''
                        )}
                    />
                ) : null}

                {multiline ? (
                    <textarea
                        {...inputProps}
                        ref={ref as React.RefObject<HTMLTextAreaElement>}
                        {...(htmlProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <input
                        {...inputProps}
                        ref={ref as React.RefObject<HTMLInputElement>}
                        type="text"
                        size={1} // Size controls the intrinsic width of the input, but we want to control the width with CSS
                        {...(htmlProps as React.InputHTMLAttributes<HTMLInputElement>)}
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
                <Tag
                    className={tcls(
                        'flex items-center gap-2 empty:hidden',
                        !multiline ? sizes[sizing].trailing : ''
                    )}
                >
                    {trailing}
                    {maxLength && !submitted && value.toString().length > maxLength * 0.8 ? (
                        <span
                            className={tcls(
                                'shrink-0 animate-fade-in text-xs tabular-nums',
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
                            size={(() => {
                                switch (sizing) {
                                    case 'small':
                                        return 'xsmall';
                                    case 'medium':
                                        return 'xsmall';
                                    case 'large':
                                        return 'medium';
                                }
                            })()}
                            label={tString(language, 'submit')}
                            onClick={handleSubmit}
                            icon={multiline ? undefined : 'arrow-right'}
                            disabled={disabled || !hasValidValue}
                            iconOnly={!multiline}
                            className={tcls(
                                'ml-auto',
                                sizing === 'large' ? 'rounded-corners:rounded-lg' : ''
                            )}
                            {...(typeof submitButton === 'object' ? submitButton : {})}
                        />
                    ) : null}
                </Tag>
            ) : null}
        </Tag>
    );
});
