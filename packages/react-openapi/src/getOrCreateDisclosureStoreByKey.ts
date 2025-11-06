import type { Key } from 'react-stately';
import { createStore } from 'zustand';

type DisclosureState = {
    expandedKeys: Set<Key>;
};

type DisclosureActions = {
    setExpandedKeys: (keys: Set<Key>) => void;
    toggleKey: (key: Key) => void;
};

export type DisclosureStore = DisclosureState & DisclosureActions;

const createDisclosureStore = (initialKeys?: Iterable<Key>) => {
    return createStore<DisclosureStore>()((set) => ({
        expandedKeys: initialKeys ? new Set(initialKeys) : new Set(),
        setExpandedKeys: (keys) => {
            set(() => ({ expandedKeys: keys }));
        },
        toggleKey: (key) => {
            set((state) => {
                const newKeys = new Set(state.expandedKeys);
                if (newKeys.has(key)) {
                    newKeys.delete(key);
                } else {
                    newKeys.add(key);
                }
                return { expandedKeys: newKeys };
            });
        },
    }));
};

const defaultDisclosureStores = new Map<string, ReturnType<typeof createDisclosureStore>>();

const createDisclosureStoreFactory = (stores: typeof defaultDisclosureStores) => {
    return (storeKey: string, initialKeys?: Iterable<Key>) => {
        if (!stores.has(storeKey)) {
            stores.set(storeKey, createDisclosureStore(initialKeys));
        }
        const store = stores.get(storeKey);
        if (!store) {
            throw new Error(`Failed to get or create store for key: ${storeKey}`);
        }
        return stores.get(storeKey)!;
    };
};

export const getOrCreateDisclosureStoreByKey =
    createDisclosureStoreFactory(defaultDisclosureStores);
