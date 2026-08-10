'use client';
import clsx from 'classnames';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Button, Disclosure, DisclosurePanel } from 'react-aria-components';

/**
 * Display an interactive OpenAPI disclosure.
 */
export function OpenAPIDisclosure(props: {
    icon: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
    label: string | ((isExpanded: boolean) => string);
    className?: string;
    defaultExpanded?: boolean;
    /**
     * Anchor id used as a deep-link target. When set, the disclosure expands and scrolls the
     * element carrying this id into view once the URL hash matches it.
     */
    id?: string;
}): React.JSX.Element {
    const { icon, header, label, children, className, defaultExpanded = false, id } = props;
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Expand and scroll into view when the URL hash points to this disclosure.
    useEffect(() => {
        if (!id) {
            return;
        }

        const openFromHash = () => {
            if (window.location.hash.slice(1) !== id) {
                return;
            }
            setIsExpanded(true);
            requestAnimationFrame(() => {
                document.getElementById(id)?.scrollIntoView({ block: 'start' });
            });
        };

        openFromHash();
        window.addEventListener('hashchange', openFromHash);
        return () => window.removeEventListener('hashchange', openFromHash);
    }, [id]);

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
                {header}
                <div className="openapi-disclosure-trigger-label">
                    {label ? (
                        <span>{typeof label === 'function' ? label(isExpanded) : label}</span>
                    ) : null}
                    {icon}
                </div>
            </Button>
            {isExpanded ? (
                <DisclosurePanel className="openapi-disclosure-panel">{children}</DisclosurePanel>
            ) : null}
        </Disclosure>
    );
}
