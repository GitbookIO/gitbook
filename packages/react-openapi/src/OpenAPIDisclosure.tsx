'use client';
import { useState } from 'react';
import { Button, Disclosure, DisclosurePanel, Heading } from 'react-aria-components';
import type { OpenAPIClientContext } from './types';

/**
 * Display an interactive OpenAPI disclosure.
 */
export function OpenAPIDisclosure(props: {
    context: OpenAPIClientContext;
    children: React.ReactNode;
    label: string;
}): React.JSX.Element {
    const { context, children, label } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Disclosure
            className="openapi-disclosure"
            isExpanded={isExpanded}
            onExpandedChange={setIsExpanded}
        >
            <Heading>
                <Button
                    slot="trigger"
                    className="openapi-disclosure-trigger"
                    style={({ isFocusVisible }) => ({
                        outline: isFocusVisible
                            ? '2px solid rgb(var(--primary-color-500) / 0.4)'
                            : 'none',
                    })}
                >
                    {context.icons.plus}
                    <span>
                        {isExpanded ? 'Hide' : 'Show'} {label}
                    </span>
                </Button>
            </Heading>
            <DisclosurePanel className="openapi-disclosure-panel">
                {isExpanded ? children : null}
            </DisclosurePanel>
        </Disclosure>
    );
}
