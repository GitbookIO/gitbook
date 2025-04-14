'use client';
import clsx from 'clsx';
import type React from 'react';
import { useState } from 'react';
import { Button, Disclosure, DisclosurePanel } from 'react-aria-components';

/**
 * Display an interactive OpenAPI disclosure.
 */
export function OpenAPIDisclosure(props: {
    icon: React.ReactNode;
    children: React.ReactNode;
    label: string | ((isExpanded: boolean) => string);
    className?: string;
}): React.JSX.Element {
    const { icon, children, label, className } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Disclosure
            className={clsx('openapi-disclosure', className)}
            isExpanded={isExpanded}
            onExpandedChange={setIsExpanded}
        >
            <Button
                slot="trigger"
                className="openapi-disclosure-trigger"
                style={({ isFocusVisible }) => ({
                    outline: isFocusVisible
                        ? '2px solid rgb(var(--primary-color-500) / 0.4)'
                        : 'none',
                })}
            >
                {icon}
                <span>{typeof label === 'function' ? label(isExpanded) : label}</span>
            </Button>
            <DisclosurePanel className="openapi-disclosure-panel">
                {isExpanded ? children : null}
            </DisclosurePanel>
        </Disclosure>
    );
}
