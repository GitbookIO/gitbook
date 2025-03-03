'use client';

import { createStore } from 'zustand';

type Key = string | number;

type TabState = {
    tabKey: Key | null;
};

type TabActions = { setTabKey: (tab: Key | null) => void };

type TabStore = TabState & TabActions;

const createTabStore = (initialTab?: Key) => {
    return createStore<TabStore>()((set) => ({
        tabKey: initialTab ?? null,
        setTabKey: (tabKey) => {
            set(() => ({ tabKey }));
        },
    }));
};

const defaultTabStores = new Map<string, ReturnType<typeof createTabStore>>();

const createTabStoreFactory = (stores: typeof defaultTabStores) => {
    return (storeKey: string, initialKey?: Key) => {
        if (!stores.has(storeKey)) {
            stores.set(storeKey, createTabStore(initialKey));
        }
        return stores.get(storeKey)!;
    };
};

export const getOrCreateTabStoreByKey = createTabStoreFactory(defaultTabStores);
