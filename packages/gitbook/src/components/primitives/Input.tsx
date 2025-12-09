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
    /**
     * When true, a submit button will be shown to the right of the input.
     */
    submitButton?: boolean | ButtonProps;
    keyboardShortcut?: boolean | ReactNode;
    onSubmit: (value: string | number | readonly string[] | undefined) => void;
} & (
    | (React.InputHTMLAttributes<HTMLInputElement> & { multiline?: false })
    | (React.TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true })
);

/**
 * Input base component with core functionality and shared styles.
 */
export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
    (props, passedRef) => {
        const {
            multiline,
            value: initialValue,
            leading,
            trailing,
            className,
            submitButton,
            label,
            'aria-label': ariaLabel,
            placeholder,
            keyboardShortcut,
            onSubmit,
            onChange,
            ...rest
        } = props;

        const [value, setValue] = React.useState(initialValue ?? '');
        const internalRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
        const ref = passedRef ?? internalRef;

        const language = useLanguage();
        const hasValue = value.toString().trim();

        React.useEffect(() => {
            setValue(initialValue ?? '');
        }, [initialValue]);

        const handleClick = () => {
            const element = internalRef.current;
            if (element) {
                element.focus();
            }
        };

        const handleSubmit = () => {
            if (hasValue) {
                onSubmit(value);
            }
        };

        const input = (
            <input
                className="peer grow resize-none overflow-visible outline-none placeholder:text-tint"
                ref={ref as React.Ref<HTMLInputElement>}
                value={value}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        handleSubmit();
                    }
                }}
                onChange={(event) => {
                    setValue(event.target.value);
                    onChange?.(
                        event as React.ChangeEvent<HTMLInputElement> &
                            React.ChangeEvent<HTMLTextAreaElement>
                    );
                }}
                aria-label={ariaLabel ?? label}
                placeholder={placeholder ? placeholder : label}
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
            />
        );

        return (
            <div
                className={tcls(
                    'relative flex max-h-64 min-h-min gap-2 overflow-auto circular-corners:rounded-3xl rounded-corners:rounded-xl border border-tint-subtle bg-tint-base p-3 transition-[outline,border] focus-within:outline-2 focus-within:outline-primary-hover hover:cursor-text hover:border-tint-hover',
                    multiline ? 'resize-y flex-col' : 'flex-row',
                    className
                )}
                onClick={handleClick}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        handleClick();
                    }
                }}
            >
                <div
                    className={tcls('flex grow gap-2', multiline ? 'items-start' : 'items-center')}
                >
                    {leading ? (
                        typeof leading === 'string' ? (
                            <Icon icon={leading as IconName} className="my-0.5 size-4 shrink-0" />
                        ) : (
                            leading
                        )
                    ) : null}
                    {multiline ? <textarea {...input.props} /> : input}
                    {keyboardShortcut !== false ? (
                        typeof keyboardShortcut === 'object' ? (
                            keyboardShortcut
                        ) : hasValue ? (
                            <KeyboardShortcut keys={['ENTER']} />
                        ) : null
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    {trailing ? trailing : null}
                    {submitButton ? (
                        <Button
                            variant="primary"
                            size="medium"
                            label={tString(language, 'submit')}
                            onClick={handleSubmit}
                            icon={multiline ? undefined : 'arrow-right'}
                            disabled={!hasValue}
                            iconOnly={!multiline}
                            className="ml-auto"
                            {...(typeof submitButton === 'object'
                                ? { ...submitButton }
                                : undefined)}
                        />
                    ) : null}
                </div>
            </div>
        );
    }
);
