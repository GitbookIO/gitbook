'use client';

import classNames from 'classnames';
import React, { useCallback } from 'react';

interface InteractiveSectionTab {
    key: string;
    label: string;
    body: React.ReactNode;
}

let globalState: Record<string, string> = {};
const listeners = new Set<() => void>();

function useSyncedTabsGlobalState() {
    const subscribe = useCallback((callback: () => void) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
    }, []);

    const getSnapshot = useCallback(() => globalState, []);

    const setSyncedTabs = useCallback(
        (updater: (tabs: Record<string, string>) => Record<string, string>) => {
            globalState = updater(globalState);
            listeners.forEach((listener) => listener());
        },
        [],
    );

    const tabs = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return [tabs, setSyncedTabs] as const;
}

/**
 * To optimize rendering, most of the components are server-components,
 * and the interactiveness is mainly handled by a few key components like this one.
 */
export function InteractiveSection(props: {
    id?: string;
    /** Class name to be set on the section, sub-elements will use it as prefix */
    className: string;
    /** If true, the content can be toggeable */
    toggeable?: boolean;
    /** Default state of the toggle */
    defaultOpened?: boolean;
    /** Icon to display for the toggle */
    toggleIcon?: React.ReactNode;
    /** Tabs of content to display */
    tabs?: Array<InteractiveSectionTab>;
    /** Default tab to have opened */
    defaultTab?: string;
    /** Content of the header */
    header?: React.ReactNode;
    /** Body of the section */
    children?: React.ReactNode;
    /** Children to display within the container */
    overlay?: React.ReactNode;
    /** An optional key referencing a value in global state */
    stateKey?: string;
}) {
    const {
        id,
        className,
        toggeable = false,
        defaultOpened = true,
        tabs = [],
        defaultTab = tabs[0]?.key,
        header,
        children,
        overlay,
        toggleIcon = '▶',
        stateKey,
    } = props;
    const [syncedTabs, setSyncedTabs] = useSyncedTabsGlobalState();
    const tabFromState =
        stateKey && stateKey in syncedTabs
            ? tabs.find((tab) => tab.key === syncedTabs[stateKey])
            : undefined;

    const [opened, setOpened] = React.useState(defaultOpened);
    const [selectedTabKey, setSelectedTab] = React.useState(tabFromState?.key ?? defaultTab);
    const selectedTab: InteractiveSectionTab | undefined =
        tabFromState ?? tabs.find((tab) => tab.key === selectedTabKey) ?? tabs[0];

    return (
        <div
            id={id}
            className={classNames(
                'openapi-section',
                toggeable ? 'openapi-section-toggeable' : null,
                className,
                toggeable ? `${className}-${opened ? 'opened' : 'closed'}` : null,
            )}
        >
            {header ? (
                <div
                    onClick={() => {
                        if (toggeable) {
                            setOpened(!opened);
                        }
                    }}
                    className={classNames('openapi-section-header', `${className}-header`)}
                >
                    <div
                        className={classNames(
                            'openapi-section-header-content',
                            `${className}-header-content`,
                        )}
                    >
                        {(children || selectedTab?.body) && toggeable ? (
                            <button
                                className={classNames(
                                    'openapi-section-toggle',
                                    `${className}-toggle`,
                                )}
                                onClick={() => setOpened(!opened)}
                                aria-expanded={opened}
                            >
                                {toggleIcon}
                            </button>
                        ) : null}
                        {header}
                    </div>
                    <div
                        className={classNames(
                            'openapi-section-header-controls',
                            `${className}-header-controls`,
                        )}
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        {tabs.length > 1 ? (
                            <select
                                className={classNames(
                                    'openapi-section-select',
                                    'openapi-select',
                                    `${className}-tabs-select`,
                                )}
                                value={selectedTab.key}
                                onChange={(event) => {
                                    setSelectedTab(event.target.value);
                                    if (stateKey) {
                                        setSyncedTabs((state) => ({
                                            ...state,
                                            [stateKey]: event.target.value,
                                        }));
                                    }
                                    setOpened(true);
                                }}
                            >
                                {tabs.map((tab) => (
                                    <option key={tab.key} value={tab.key}>
                                        {tab.label}
                                    </option>
                                ))}
                            </select>
                        ) : null}
                    </div>
                </div>
            ) : null}
            {(!toggeable || opened) && (children || selectedTab?.body) ? (
                <div className={classNames('openapi-section-body', `${className}-body`)}>
                    {children}
                    {selectedTab?.body}
                </div>
            ) : null}
            {overlay ? (
                <div className={classNames('openapi-section-overlay', `${className}-overlay`)}>
                    {overlay}
                </div>
            ) : null}
        </div>
    );
}
