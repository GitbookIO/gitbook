import React from 'react';

interface Props {
    groups: TDisclosureGroup[];
    icon?: React.ReactNode;
}

type TDisclosureGroup = {
    id: string;
    label: string | React.ReactNode;
    tabs?: {
        id: string;
        label: string | React.ReactNode;
        body?: React.ReactNode;
    }[];
};

import { mergeProps, useButton, useDisclosure, useFocusRing, useId } from 'react-aria';
import {
    DisclosureGroupProps,
    DisclosureGroupState,
    useDisclosureGroupState,
    useDisclosureState,
} from 'react-stately';
import classNames from 'classnames';

const DisclosureGroupStateContext = React.createContext<DisclosureGroupState | null>(null);

/**
 * Display an interactive OpenAPI disclosure group.
 */
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

function DisclosureItem(props: { group: TDisclosureGroup; icon?: React.ReactNode }) {
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
    const isDisabled = groupState?.isDisabled || !group.tabs?.length || false;
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

    const defaultTab = group.tabs?.[0]?.id || '';
    const [selectedTabKey, setSelectedTabKey] = React.useState(defaultTab);
    const selectedTab = group.tabs?.find((tab) => tab.id === selectedTabKey);

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
                            <select
                                className={classNames(
                                    'openapi-section-select',
                                    'openapi-select',
                                    `openapi-disclosure-group-tabs-select`,
                                )}
                                onClick={(event) => event.stopPropagation()}
                                value={selectedTab?.id}
                                onChange={(event) => {
                                    setSelectedTabKey(event.target.value);
                                    state.expand();
                                }}
                            >
                                {group.tabs.map((tab) => (
                                    <option key={tab.id} value={tab.id}>
                                        {tab.label}
                                    </option>
                                ))}
                            </select>
                        ) : !!group.tabs[0] ? (
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
