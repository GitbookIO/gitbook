import { DisclosureGroup } from 'react-aria-components';
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
    body?: React.ReactNode;
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

    const state = useDisclosureGroupState(props);

    return (
        <DisclosureGroupStateContext.Provider value={state}>
            {groups.map((group) => (
                <DisclosureItem icon={icon} key={group.id} group={group} />
            ))}
        </DisclosureGroupStateContext.Provider>
    );
}

function DisclosureItem(props: { group: DisclosureGroup; icon?: React.ReactNode }) {
    const { icon, group } = props;

    const defaultId = useId();
    const id = group.id || defaultId;
    const groupState = React.useContext(DisclosureGroupStateContext);
    const isExpanded = groupState?.expandedKeys.has(id) || false;
    const state = useDisclosureState({
        isExpanded,
        onExpandedChange() {
            if (groupState) {
                groupState.toggleKey(id);
            }
        },
    });

    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const isDisabled = groupState?.isDisabled || !group.body || false;
    const { buttonProps: triggerProps, panelProps } = useDisclosure(
        {
            ...props,
            isExpanded,
            isDisabled,
        },
        state,
        panelRef,
    );
    const { buttonProps } = useButton(triggerProps, triggerRef);
    const { isFocusVisible, focusProps } = useFocusRing();

    return (
        <div className="openapi-disclosure-group">
            <button
                slot="trigger"
                ref={triggerRef}
                {...mergeProps(buttonProps, focusProps)}
                disabled={isDisabled}
                style={{
                    outline: isFocusVisible
                        ? '2px solid rgb(var(--primary-color-500)/0.4)'
                        : 'none',
                }}
                className="openapi-disclosure-group-trigger"
            >
                {!!group.body ? (
                    <div className="openapi-disclosure-group-icon">
                        {icon || (
                            <svg viewBox="0 0 24 24" className="openapi-disclosure-group-icon">
                                <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        )}
                    </div>
                ) : null}
                {group.label}
            </button>

            {state.isExpanded && !!group.body && (
                <div className="openapi-disclosure-group-panel" ref={panelRef} {...panelProps}>
                    {group.body}
                </div>
            )}
        </div>
    );
}
