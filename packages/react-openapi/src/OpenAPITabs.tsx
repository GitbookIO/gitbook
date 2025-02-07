'use client';

import { createContext, useContext, useState } from 'react';
import { Key, Tab, TabList, TabPanel, Tabs, TabsProps } from 'react-aria-components';
import { Markdown } from './Markdown';
import { useSyncedTabsGlobalState } from './useSyncedTabsGlobalState';

export type Tab = {
    key: Key;
    label: string;
    body: React.ReactNode;
    description?: string;
};

type OpenAPITabsContextData = {
    items: Tab[];
    selectedTab: Tab;
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
    props: React.PropsWithChildren<TabsProps & { items: Tab[]; stateKey?: string }>,
) {
    const { children, items, stateKey } = props;

    const [syncedTabs, setSyncedTabs] = useSyncedTabsGlobalState();
    const tabFromState =
        stateKey && stateKey in syncedTabs
            ? items.find((tab) => tab.key === syncedTabs[stateKey])
            : undefined;
    const defaultTab = items[0]?.key;
    const [selectedTabKey, setSelectedTabKey] = useState(tabFromState?.key ?? defaultTab);

    const selectedTab = tabFromState ?? items.find((tab) => tab.key === selectedTabKey) ?? items[0];

    const contextValue = { items, selectedTab };

    const handleSelectionChange = (key: Key) => {
        setSelectedTabKey(key);
        if (stateKey) {
            setSyncedTabs((state) => ({
                ...state,
                [stateKey]: key.toString(),
            }));
        }
    };

    return (
        <OpenAPITabsContext.Provider value={contextValue}>
            <Tabs
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
