'use client';

import clsx from 'classnames';
import { createContext, useContext, useRef } from 'react';
import { mergeProps, useButton, useDisclosure, useFocusRing, useId } from 'react-aria';
import type { Key } from 'react-aria';
import {
    type DisclosureGroupProps,
    type DisclosureGroupState,
    useDisclosureGroupState,
    useDisclosureState,
} from 'react-stately';
import { useStore } from 'zustand';
import { OpenAPISelect, OpenAPISelectItem, useSelectState } from './OpenAPISelect';
import { getOrCreateDisclosureStoreByKey } from './getOrCreateDisclosureStoreByKey';

interface Props {
    groups: TDisclosureGroup[];
    icon?: React.ReactNode;
    /** State key to use with a store */
    selectStateKey?: string;
    /** State key to synchronize disclosure groups across the page */
    stateKey?: string;
    /** Icon to display for the select */
    selectIcon?: React.ReactNode;
    className?: string;
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

function useDisclosureGroupStore(stateKey = 'disclosure-group', initialKeys?: Iterable<Key>) {
    const store = useStore(getOrCreateDisclosureStoreByKey(stateKey, initialKeys));
    return store;
}

/**
 * Display an interactive OpenAPI disclosure group.
 */
export function OpenAPIDisclosureGroup(props: DisclosureGroupProps & Props) {
    const {
        icon,
        groups,
        selectStateKey,
        stateKey,
        selectIcon,
        className,
        expandedKeys,
        defaultExpandedKeys,
        onExpandedChange,
    } = props;

    const initialKeys =
        expandedKeys || defaultExpandedKeys
            ? new Set(expandedKeys || defaultExpandedKeys)
            : undefined;
    const { expandedKeys: storeExpandedKeys, setExpandedKeys } = useDisclosureGroupStore(
        stateKey,
        initialKeys
    );

    const state = useDisclosureGroupState({
        ...props,
        expandedKeys: storeExpandedKeys,
        onExpandedChange: (keys) => {
            setExpandedKeys(keys);
            onExpandedChange?.(keys);
        },
    });

    return (
        <DisclosureGroupStateContext.Provider value={state}>
            {groups.map((group) => (
                <DisclosureItem
                    className={className}
                    selectStateKey={selectStateKey}
                    selectIcon={selectIcon}
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
    selectIcon?: React.ReactNode;
    className?: string;
}) {
    const { icon, group, selectStateKey, selectIcon, className } = props;

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
    const triggerRef = useRef<HTMLDivElement | null>(null);
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
        <div
            className={clsx('openapi-disclosure-group', className)}
            aria-expanded={state.isExpanded}
        >
            <div
                slot="trigger"
                ref={triggerRef}
                {...mergeProps(buttonProps, focusProps)}
                aria-disabled={isDisabled}
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

                <div className="openapi-disclosure-group-label">
                    {group.label}

                    {group.tabs ? (
                        <div
                            className="openapi-disclosure-group-mediatype"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {group.tabs?.length > 1 ? (
                                <OpenAPISelect
                                    icon={selectIcon}
                                    stateKey={selectStateKey}
                                    onChange={() => {
                                        state.expand();
                                    }}
                                    items={group.tabs}
                                    placement="bottom end"
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
            </div>

            {state.isExpanded && selectedTab && (
                <div className="openapi-disclosure-group-panel" ref={panelRef} {...panelProps}>
                    {selectedTab.body}
                </div>
            )}
        </div>
    );
}
