'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { type Key, Tab, TabList, TabPanel, Tabs, type TabsProps } from 'react-aria-components';
import { useIntersectionObserver } from 'usehooks-ts';
import { Markdown } from './Markdown';
import { useSyncedTabsGlobalState } from './useSyncedTabsGlobalState';

export type TabItem = {
    key: Key;
    label: string;
    body: React.ReactNode;
    description?: string;
};

type OpenAPITabsContextData = {
    items: TabItem[];
    selectedTab: TabItem;
};

const OpenAPITabsContext = createContext<OpenAPITabsContextData | null>(null);

function useOpenAPITabsContext() {
    const context = useContext(OpenAPITabsContext);
    if (!context) {
        throw new Error('OpenAPITabsContext is missing');
    }
    return context;
}

/**
 * The OpenAPI Tabs wrapper component.
 */
export function OpenAPITabs(
    props: React.PropsWithChildren<TabsProps & { items: TabItem[]; stateKey?: string }>
) {
    const { children, items, stateKey } = props;
    const [ref, isIntersectionVisible] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '200px',
    });
    const isVisible = stateKey ? isIntersectionVisible : true;
    const defaultTab = items[0] as TabItem;
    const [syncedTabs, setSyncedTabs] = useSyncedTabsGlobalState<TabItem>();
    const [selectedTabKey, setSelectedTabKey] = useState(() => {
        if (isVisible && stateKey && syncedTabs && syncedTabs.has(stateKey)) {
            const tabFromState = syncedTabs.get(stateKey);
            return tabFromState?.key ?? items[0]?.key;
        }
        return items[0]?.key;
    });
    const [selectedTab, setSelectedTab] = useState<TabItem>(defaultTab);

    const handleSelectionChange = (key: Key) => {
        setSelectedTabKey(key);
        if (stateKey) {
            const tab = items.find((item) => item.key === key);

            if (!tab) {
                return;
            }

            setSyncedTabs((state) => {
                const newState = new Map(state);
                newState.set(stateKey, tab);
                return newState;
            });
        }
    };

    useEffect(() => {
        if (isVisible && stateKey && syncedTabs && syncedTabs.has(stateKey)) {
            const tabFromState = syncedTabs.get(stateKey);

            if (!items.some((item) => item.key === tabFromState?.key)) {
                return setSelectedTab(defaultTab);
            }

            if (tabFromState && tabFromState?.key !== selectedTab?.key) {
                const tabFromItems = items.find((item) => item.key === tabFromState.key);

                if (!tabFromItems) {
                    return;
                }

                setSelectedTab(tabFromItems);
            }
        }
    }, [isVisible, stateKey, syncedTabs, selectedTabKey]);

    const contextValue = useMemo(() => ({ items, selectedTab }), [items, selectedTab]);

    return (
        <OpenAPITabsContext.Provider value={contextValue}>
            <Tabs
                ref={ref}
                className="openapi-tabs"
                onSelectionChange={handleSelectionChange}
                selectedKey={selectedTab?.key}
            >
                {children}
            </Tabs>
        </OpenAPITabsContext.Provider>
    );
}

/**
 * The OpenAPI Tabs list component.
 * This component should be used as a child of the OpenAPITabs component.
 * It renders the list of tabs.
 */
export function OpenAPITabsList() {
    const { items } = useOpenAPITabsContext();

    return (
        <TabList className="openapi-tabs-list">
            {items.map((tab) => (
                <Tab
                    style={({ isFocusVisible }) => ({
                        outline: isFocusVisible
                            ? '2px solid rgb(var(--primary-color-500)/0.4)'
                            : 'none',
                    })}
                    className="openapi-tabs-tab"
                    key={`Tab-${tab.key}`}
                    id={tab.key}
                >
                    {tab.label}
                </Tab>
            ))}
        </TabList>
    );
}

/**
 * The OpenAPI Tabs panels component.
 * This component should be used as a child of the OpenAPITabs component.
 * It renders the content of the selected tab.
 */
export function OpenAPITabsPanels() {
    const { selectedTab } = useOpenAPITabsContext();

    if (!selectedTab) {
        return null;
    }

    return (
        <TabPanel
            key={`TabPanel-${selectedTab.key}`}
            id={selectedTab.key.toString()}
            className="openapi-tabs-panel"
        >
            {selectedTab.body}
            {selectedTab.description ? (
                <Markdown source={selectedTab.description} className="openapi-tabs-footer" />
            ) : null}
        </TabPanel>
    );
}
