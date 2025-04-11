import { createStore } from 'zustand';

type Key = string | number;

type State = {
    key: Key | null;
};

type Actions = { setKey: (key: Key | null) => void };

export type Store = State & Actions;

const createStateStore = (initial?: Key) => {
    return createStore<Store>()((set) => ({
        key: initial ?? null,
        setKey: (key) => {
            set(() => ({ key }));
        },
    }));
};

const defaultStores = new Map<string, ReturnType<typeof createStateStore>>();

const createStateStoreFactory = (stores: typeof defaultStores) => {
    return (storeKey: string, initialKey?: Key) => {
        if (!stores.has(storeKey)) {
            stores.set(storeKey, createStateStore(initialKey));
        }
        return stores.get(storeKey)!;
    };
};

export const getOrCreateStoreByKey = createStateStoreFactory(defaultStores);
