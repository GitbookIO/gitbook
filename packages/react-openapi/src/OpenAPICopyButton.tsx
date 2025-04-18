'use client';

import { useState } from 'react';
import { Button, type ButtonProps, Tooltip, TooltipTrigger } from 'react-aria-components';
import type { OpenAPIClientContext } from './context';
import { t } from './translate';

export function OpenAPICopyButton(
    props: ButtonProps & {
        value: string;
        children: React.ReactNode;
        context: OpenAPIClientContext;
        label?: string;
        /**
         * Whether to show a tooltip.
         * @default true
         */
        withTooltip?: boolean;
    }
) {
    const { value, label, children, onPress, className, context, withTooltip = true } = props;
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
        <TooltipTrigger
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            isDisabled={!withTooltip}
            closeDelay={200}
            delay={200}
        >
            <Button
                type="button"
                preventFocusOnPress
                onPress={(e) => {
                    handleCopy();
                    onPress?.(e);
                }}
                className={`openapi-copy-button ${className}`}
                {...props}
            >
                {children}
            </Button>

            <Tooltip
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                placement="top"
                offset={4}
                className="openapi-tooltip"
            >
                {copied
                    ? t(context.translation, 'copied')
                    : label || t(context.translation, 'copy_to_clipboard')}
            </Tooltip>
        </TooltipTrigger>
    );
}
