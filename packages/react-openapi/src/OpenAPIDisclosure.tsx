import {
    Button,
    Disclosure,
    DisclosureGroup,
    DisclosurePanel,
    Heading,
    Key,
} from 'react-aria-components';
import React from 'react';

interface Props {
    groups: {
        key: string;
        label: string | React.ReactNode;
        body: React.ReactNode;
    }[];
    icon?: React.ReactNode;
}

export function OpenAPIDisclosureGroup({ groups, icon }: Props) {
    const [expanded, setExpanded] = React.useState<Set<Key>>();

    return (
        <DisclosureGroup
            onExpandedChange={setExpanded}
            expandedKeys={expanded}
            allowsMultipleExpanded
            className="openapi-disclosure-group"
        >
            {groups.map((group) => (
                <Disclosure id={group.key} className="openapi-disclosure" key={group.key}>
                    <Button slot="trigger" className="openapi-disclosure-trigger">
                        {icon || (
                            <svg viewBox="0 0 24 24" className="openapi-disclosure-icon">
                                <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        )}
                        {group.label}
                    </Button>

                    {expanded?.has(group.key) && (
                        <DisclosurePanel className="openapi-disclosure-panel">
                            {group.body}
                        </DisclosurePanel>
                    )}
                </Disclosure>
            ))}
        </DisclosureGroup>
    );
}
