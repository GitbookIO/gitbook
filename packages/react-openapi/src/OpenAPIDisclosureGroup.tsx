'use client';

import clsx from 'classnames';
import { createContext, useContext, useId } from 'react';
import { useStore } from 'zustand';
import { OpenAPISelect, useSelectState } from './OpenAPISelect';
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

export type Key = string | number;

type DisclosureGroupState = {
    expandedKeys: Set<Key>;
    toggleKey: (key: Key) => void;
    isDisabled: boolean;
};

const DisclosureGroupStateContext = createContext<DisclosureGroupState | null>(null);

type DisclosureGroupProps = {
    /** When false, expanding a group collapses the others. */
    allowsMultipleExpanded?: boolean;
    expandedKeys?: Iterable<Key>;
    defaultExpandedKeys?: Iterable<Key>;
    onExpandedChange?: (keys: Set<Key>) => void;
    isDisabled?: boolean;
};

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

    // When `expandedKeys` is provided, the group is controlled by the parent. Otherwise it owns
    // its expanded state in a store keyed by `stateKey`.
    const isControlled = expandedKeys !== undefined;

    const initialKeys = defaultExpandedKeys ? new Set(defaultExpandedKeys) : undefined;
    const { expandedKeys: storeExpandedKeys, setExpandedKeys } = useDisclosureGroupStore(
        stateKey,
        initialKeys
    );

    const currentKeys = new Set(isControlled ? expandedKeys : storeExpandedKeys);
    const state: DisclosureGroupState = {
        expandedKeys: currentKeys,
        isDisabled: props.isDisabled ?? false,
        toggleKey: (key) => {
            const next = new Set(props.allowsMultipleExpanded ? currentKeys : []);
            if (currentKeys.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            if (!isControlled) {
                setExpandedKeys(next);
            }
            onExpandedChange?.(next);
        },
    };

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
    const isDisabled = groupState?.isDisabled || !group.tabs?.length || false;
    const panelId = `${id}-panel`;
    const toggle = () => {
        if (!isDisabled) {
            groupState?.toggleKey(id);
        }
    };

    const defaultTab = group.tabs?.[0]?.key || '';
    const store = useSelectState(selectStateKey, defaultTab);
    const selectedTab = group.tabs?.find((tab) => tab.key === store.key) || group.tabs?.[0];

    return (
        <div className={clsx('openapi-disclosure-group', className)}>
            {/* A div, not a button: the header hosts the media-type select. */}
            <div
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                aria-disabled={isDisabled}
                onClick={toggle}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggle();
                    }
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
                                        if (!isExpanded) {
                                            groupState?.toggleKey(id);
                                        }
                                    }}
                                    items={group.tabs}
                                    placement="bottom end"
                                >
                                    {(tab) => tab.label}
                                </OpenAPISelect>
                            ) : group.tabs[0]?.label ? (
                                <span>{group.tabs[0].label}</span>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>

            {isExpanded && selectedTab && (
                <div className="openapi-disclosure-group-panel" id={panelId}>
                    {selectedTab.body}
                </div>
            )}
        </div>
    );
}
