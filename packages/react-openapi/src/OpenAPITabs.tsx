'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { Key, Tab, TabList, TabPanel, Tabs, TabsProps } from 'react-aria-components';
import { Markdown } from './Markdown';

export type Tab = {
    key: Key;
    label: string;
    body: React.ReactNode;
    description?: string;
};

type OpenAPITabsContextData = {
    items: Tab[];
    selectedKey: Key;
    setSelectedKey: (key: Key) => void;
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
export function OpenAPITabs(props: React.PropsWithChildren<TabsProps & { items: Tab[] }>) {
    const { children, items } = props;

    const [selectedKey, setSelectedKey] = useState(() => {
        const firstItem = items[0];
        if (!firstItem) {
            throw new Error('OpenAPITabs: at least one tab is required');
        }
        return firstItem.key;
    });

    const contextValue = { items, selectedKey, setSelectedKey };

    return (
        <OpenAPITabsContext.Provider value={contextValue}>
            <Tabs
                className="openapi-tabs"
                onSelectionChange={setSelectedKey}
                selectedKey={selectedKey}
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
    const { selectedKey, items } = useOpenAPITabsContext();

    const tab = useMemo(() => items.find((tab) => tab.key === selectedKey), [items, selectedKey]);

    if (!tab) {
        return null;
    }

    return (
        <TabPanel
            key={`TabPanel-${tab.key}`}
            id={tab.key.toString()}
            className="openapi-tabs-panel"
        >
            {tab.body}
            {tab.description ? (
                <Markdown source={tab.description} className="openapi-tabs-footer" />
            ) : null}
        </TabPanel>
    );
}
