'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { type Key, Tab, TabList, TabPanel, Tabs, type TabsProps } from 'react-aria-components';
import { useEventCallback } from 'usehooks-ts';
import { getOrCreateStoreByKey } from './getOrCreateStoreByKey';

export type TabItem = {
    key: Key;
    label: string;
    body: React.ReactNode;
    footer?: React.ReactNode;
};

type OpenAPITabsContextData = {
    items: TabItem[];
    selectedTab: TabItem | null;
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
    const [tabKey, setTabKey] = useState<Key | null>(() => {
        if (stateKey && typeof window !== 'undefined') {
            const store = getOrCreateStoreByKey(stateKey);
            const tabKey = store.getState().key;
            if (tabKey) {
                return tabKey;
            }
        }
        return items[0]?.key ?? null;
    });
    const selectTab = useEventCallback((key: Key | null) => {
        if (!key || key === tabKey) {
            return;
        }
        const tab = items.find((item) => item.key === key);
        if (!tab) {
            return;
        }
        setTabKey(key);
    });
    const selectedTab = items.find((item) => item.key === tabKey) ?? items[0] ?? null;
    const cancelDeferRef = useRef<(() => void) | null>(null);
    useEffect(() => {
        if (!stateKey) {
            return undefined;
        }
        const store = getOrCreateStoreByKey(stateKey);
        return store.subscribe((state) => {
            cancelDeferRef.current?.();
            cancelDeferRef.current = defer(() => selectTab(state.key));
        });
    }, [stateKey, selectTab]);
    useEffect(() => {
        return () => cancelDeferRef.current?.();
    }, []);
    const contextValue = useMemo(() => ({ items, selectedTab }), [items, selectedTab]);
    return (
        <OpenAPITabsContext.Provider value={contextValue}>
            <Tabs
                className="openapi-tabs"
                onSelectionChange={(tabKey) => {
                    selectTab(tabKey);
                    if (stateKey) {
                        const store = getOrCreateStoreByKey(stateKey);
                        store.setState({ key: tabKey });
                    }
                }}
                selectedKey={tabKey}
            >
                {children}
            </Tabs>
        </OpenAPITabsContext.Provider>
    );
}

const defer = (fn: () => void) => {
    const id = setTimeout(fn, 0);
    return () => clearTimeout(id);
};

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
                    key={tab.key}
                    id={tab.key}
                    style={({ isFocusVisible }) => ({
                        outline: isFocusVisible
                            ? '2px solid rgb(var(--primary-color-500)/0.4)'
                            : 'none',
                    })}
                    className="openapi-tabs-tab"
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

    const key = selectedTab.key.toString();

    return (
        <TabPanel id={key} className="openapi-tabs-panel">
            <div className="openapi-panel-body">{selectedTab.body}</div>
            {selectedTab.footer ? (
                <div className="openapi-panel-footer">{selectedTab.footer}</div>
            ) : null}
        </TabPanel>
    );
}
