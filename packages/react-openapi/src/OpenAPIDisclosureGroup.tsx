'use client';

import { createContext, useContext, useRef } from 'react';
import { mergeProps, useButton, useDisclosure, useFocusRing, useId } from 'react-aria';
import {
    type DisclosureGroupProps,
    type DisclosureGroupState,
    useDisclosureGroupState,
    useDisclosureState,
} from 'react-stately';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from './OpenAPISelect';

interface Props {
    groups: TDisclosureGroup[];
    icon?: React.ReactNode;
    /** State key to use with a store */
    selectStateKey?: string;
}

type TDisclosureGroup = {
    key: string;
    label: string | React.ReactNode;
    tabs?: {
        key: string;
        label: string | React.ReactNode;
        body?: React.ReactNode;
    }[];
};

const DisclosureGroupStateContext = createContext<DisclosureGroupState | null>(null);

/**
 * Display an interactive OpenAPI disclosure group.
 */
export function OpenAPIDisclosureGroup(props: DisclosureGroupProps & Props) {
    const { icon, groups, selectStateKey } = props;

    const state = useDisclosureGroupState(props);

    return (
        <DisclosureGroupStateContext.Provider value={state}>
            {groups.map((group) => (
                <DisclosureItem
                    selectStateKey={selectStateKey}
                    icon={icon}
                    key={group.key}
                    group={group}
                />
            ))}
        </DisclosureGroupStateContext.Provider>
    );
}

function DisclosureItem(props: {
    group: TDisclosureGroup;
    icon?: React.ReactNode;
    selectStateKey?: string;
}) {
    const { icon, group, selectStateKey } = props;

    const defaultId = useId();
    const id = group.key || defaultId;
    const groupState = useContext(DisclosureGroupStateContext);
    const isExpanded = groupState?.expandedKeys.has(id) || false;
    const state = useDisclosureState({
        isExpanded,
        onExpandedChange() {
            if (groupState) {
                groupState.toggleKey(id);
            }
        },
    });

    const panelRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const isDisabled = groupState?.isDisabled || !group.tabs?.length || false;
    const { buttonProps: triggerProps, panelProps } = useDisclosure(
        {
            ...props,
            isExpanded,
            isDisabled,
        },
        state,
        panelRef
    );
    const { buttonProps } = useButton(triggerProps, triggerRef);
    const { isFocusVisible, focusProps } = useFocusRing();

    const defaultTab = group.tabs?.[0]?.key || '';
    const store = useSelectState(selectStateKey, defaultTab);
    const selectedTab = group.tabs?.find((tab) => tab.key === store.key) || group.tabs?.[0];

    return (
        <div className="openapi-disclosure-group" aria-expanded={state.isExpanded}>
            <div className="openapi-disclosure-group-header">
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
                    <div className="openapi-disclosure-group-icon">
                        {icon || (
                            <svg viewBox="0 0 24 24" className="openapi-disclosure-group-icon">
                                <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        )}
                    </div>

                    {group.label}
                </button>
                {group.tabs ? (
                    <div className="openapi-disclosure-group-mediatype">
                        {group.tabs?.length > 1 ? (
                            <OpenAPISelect
                                className="openapi-section-select openapi-select openapi-disclosure-group-tabs-select"
                                // onClick={(event) => event.stopPropagation()}
                                stateKey={selectStateKey}
                                onSelectionChange={() => {
                                    state.expand();
                                }}
                                items={group.tabs}
                            >
                                {group.tabs.map((tab) => (
                                    <OpenAPISelectItem key={tab.key} id={tab.key} value={tab}>
                                        {tab.label}
                                    </OpenAPISelectItem>
                                ))}
                            </OpenAPISelect>
                        ) : group.tabs[0]?.label ? (
                            <span>{group.tabs[0].label}</span>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {state.isExpanded && selectedTab && (
                <div className="openapi-disclosure-group-panel" ref={panelRef} {...panelProps}>
                    {selectedTab.body}
                </div>
            )}
        </div>
    );
}
