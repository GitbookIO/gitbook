'use client';

import { useState } from 'react';
import { Button, type ButtonProps, Tooltip, TooltipTrigger } from 'react-aria-components';

export function OpenAPICopyButton(
    props: ButtonProps & {
        value: string;
    }
) {
    const { value } = props;
    const { children, onPress, className } = props;
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value).then(() => {
            setIsOpen(true);
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        });
    };

    return (
        <TooltipTrigger isOpen={isOpen} onOpenChange={setIsOpen} closeDelay={200} delay={200}>
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
                {copied ? 'Copied' : 'Copy to clipboard'}{' '}
            </Tooltip>
        </TooltipTrigger>
    );
}
