import React from 'react';
import { Button, Disclosure, DisclosurePanel, Key } from 'react-aria-components';
import { OpenAPIClientContext, OpenAPIContextProps } from './types';

interface Props {
    context: OpenAPIClientContext;
    children: React.ReactNode;
}

export function OpenAPISchemaObject({ context, children }: Props): JSX.Element {
    const [expanded, setExpanded] = React.useState<boolean>();

    return (
        <Disclosure onExpandedChange={setExpanded} className="openapi-schema-properties-disclosure">
            <Button slot="trigger" className="openapi-schema-properties-disclosure-trigger">
                {context.icons.plus}
                <span>Show child attributes</span>
            </Button>

            <DisclosurePanel className="openapi-schema-properties-disclosure-panel">
                {children}
            </DisclosurePanel>
        </Disclosure>
    );
}
