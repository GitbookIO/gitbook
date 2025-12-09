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
            'aria-busy': ariaBusy,
            placeholder,
            keyboardShortcut,
            disabled,
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
                setValue('');
            }
        };

        const input = (
            <input
                className="peer -m-2 max-h-64 grow resize-none p-3 outline-none placeholder:text-tint/8 aria-busy:cursor-progress"
                ref={ref as React.Ref<HTMLInputElement>}
                value={value}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey && value.toString().trim()) {
                        event.preventDefault();
                        handleSubmit();
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        event.currentTarget.blur();
                    }
                }}
                aria-busy={ariaBusy}
                onChange={(event) => {
                    setValue(event.target.value);
                    onChange?.(
                        event as React.ChangeEvent<HTMLInputElement> &
                            React.ChangeEvent<HTMLTextAreaElement>
                    );
                }}
                aria-label={ariaLabel ?? label}
                placeholder={placeholder ? placeholder : label}
                disabled={disabled}
                {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
            />
        );

        return (
            <div
                className={tcls(
                    'group/input relative flex min-h-min gap-2 overflow-hidden circular-corners:rounded-3xl rounded-corners:rounded-xl border border-tint-subtle bg-tint-base p-2 shadow-tint/6 ring-primary-hover transition-all dark:shadow-tint-1',
                    'depth-subtle:focus-within:-translate-y-px depth-subtle:shadow-sm depth-subtle:focus-within:shadow-lg',
                    disabled
                        ? 'cursor-not-allowed border-tint-subtle bg-tint-subtle'
                        : 'focus-within:shadow-primary-subtle focus-within:ring-2 hover:cursor-text hover:border-tint-hover',
                    multiline ? 'flex-col' : 'flex-row',
                    ariaBusy ? 'cursor-progress' : '',
                    className
                )}
                onClick={handleClick}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        handleClick();
                    }
                }}
            >
                <div className={tcls('flex grow gap-2', multiline ? '' : 'items-center')}>
                    {leading ? (
                        typeof leading === 'string' ? (
                            <Icon icon={leading as IconName} className="my-0.5 size-4 shrink-0" />
                        ) : (
                            leading
                        )
                    ) : null}
                    {multiline ? <textarea {...input.props} /> : input}

                    <div className={multiline ? 'absolute top-2.5 right-2.5' : ''}>
                        {keyboardShortcut !== false ? (
                            typeof keyboardShortcut === 'object' ? (
                                keyboardShortcut
                            ) : hasValue ? (
                                <KeyboardShortcut
                                    keys={['ENTER']}
                                    className="hidden group-focus-within/input:block"
                                />
                            ) : null
                        ) : null}
                    </div>
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
