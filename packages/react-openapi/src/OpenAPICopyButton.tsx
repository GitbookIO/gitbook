'use client';

import { useState } from 'react';
import type { ButtonProps } from 'react-aria-components';
import { OpenAPITooltip } from './OpenAPITooltip';

export function OpenAPICopyButton(
    props: ButtonProps & {
        value: string;
        children: React.ReactNode;
    }
) {
    const { value, children, onPress, className } = props;
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
        <OpenAPITooltip
            label={copied ? 'Copied' : 'Copy to clipboard'}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            closeDelay={200}
            delay={200}
        >
            <OpenAPITooltip.Button
                onPress={(e) => {
                    handleCopy();
                    onPress?.(e);
                }}
                className={className}
            >
                {children}
            </OpenAPITooltip.Button>
        </OpenAPITooltip>
    );
}
