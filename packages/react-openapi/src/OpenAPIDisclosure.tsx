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
        id: string;
        label: string | React.ReactNode;
        body: React.ReactNode;
    }[];
    icon?: React.ReactNode;
}

type DisclosureGroup = {
    id: string;
    label: string | React.ReactNode;
    body: React.ReactNode;
};

import { mergeProps, useButton, useDisclosure, useFocusRing, useId } from 'react-aria';
import {
    DisclosureGroupProps,
    DisclosureGroupState,
    useDisclosureGroupState,
    useDisclosureState,
} from 'react-stately';

const DisclosureGroupStateContext = React.createContext<DisclosureGroupState | null>(null);

export function OpenAPIDisclosureGroup(props: DisclosureGroupProps & Props) {
    const { icon, groups } = props;

    let state = useDisclosureGroupState(props);

    return (
        <div>
            <DisclosureGroupStateContext.Provider value={state}>
                {groups.map((group) => (
                    <DisclosureItem icon={icon} key={group.id} group={group} />
                ))}
            </DisclosureGroupStateContext.Provider>
        </div>
    );
}

function DisclosureItem(props: { group: DisclosureGroup; icon?: React.ReactNode }) {
    const { icon, group } = props;

    let defaultId = useId();
    const id = group.id || defaultId;
    let groupState = React.useContext(DisclosureGroupStateContext);
    let isExpanded = groupState?.expandedKeys.has(id) || false;
    let state = useDisclosureState({
        isExpanded,
        onExpandedChange(isExpanded) {
            if (groupState) {
                groupState.toggleKey(id);
            }
        },
    });

    let panelRef = React.useRef<HTMLDivElement | null>(null);
    let triggerRef = React.useRef<HTMLButtonElement | null>(null);
    let isDisabled = groupState?.isDisabled || false;
    let { buttonProps: triggerProps, panelProps } = useDisclosure(
        {
            ...props,
            isExpanded,
            isDisabled,
        },
        state,
        panelRef,
    );
    let { buttonProps } = useButton(triggerProps, triggerRef);
    let { isFocusVisible, focusProps } = useFocusRing();

    return (
        <div className="openapi-disclosure-group">
            <h3>
                <button
                    slot="trigger"
                    ref={triggerRef}
                    {...mergeProps(buttonProps, focusProps)}
                    style={{
                        outline: isFocusVisible
                            ? '2px solid rgb(var(--primary-color-500)/0.4)'
                            : 'none',
                    }}
                    className="openapi-disclosure-group-trigger"
                >
                    <div className="openapi-disclosure-group-icon">
                        {icon || (
                            <svg viewBox="0 0 24 24" className="openapi-disclosure-group-icon">
                                <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        )}
                    </div>
                    {group.label}
                </button>
            </h3>

            {state.isExpanded && (
                <div className="openapi-disclosure-group-panel" ref={panelRef} {...panelProps}>
                    {group.body}
                </div>
            )}
        </div>
    );
}
