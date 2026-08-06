'use client';

import clsx from 'classnames';
import { useState } from 'react';
import { OpenAPITooltip } from './OpenAPITooltip';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';

export function OpenAPICopyButton(props: {
    value: string;
    children: React.ReactNode;
    context: OpenAPIClientContext;
    label?: string;
    className?: string;
    isDisabled?: boolean;
    onClick?: () => void;
    /**
     * Whether to show a tooltip.
     * @default true
     */
    withTooltip?: boolean;
}) {
    const { value, label, children, onClick, className, context, isDisabled, withTooltip } = props;
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value).then(() => {
            setIsOpen(true);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 2000);
        });
    };

    return (
        <OpenAPITooltip disabled={!withTooltip} open={isOpen} onOpenChange={setIsOpen}>
            <OpenAPITooltip.Trigger
                render={
                    <button
                        type="button"
                        disabled={isDisabled}
                        data-disabled={isDisabled ? 'true' : undefined}
                        // Stands in for react-aria's `preventFocusOnPress`.
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                            handleCopy();
                            onClick?.();
                        }}
                        className={clsx('openapi-copy-button', className)}
                    >
                        {children}
                    </button>
                }
            />

            <OpenAPITooltip.Content>
                {copied ? (
                    <>
                        {context.icons.check}
                        {t(context.translation, 'copied')}
                    </>
                ) : (
                    label || t(context.translation, 'copy_to_clipboard')
                )}
            </OpenAPITooltip.Content>
        </OpenAPITooltip>
    );
}
