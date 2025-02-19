'use client';

import { create } from 'zustand';

interface SyncedTabsState<T> {
    tabs: Map<string, T>;
    setTabs: (updater: (tabs: Map<string, T>) => Map<string, T>) => void;
}

const useSyncedTabsStore = create<SyncedTabsState<any>>()((set) => ({
    tabs: new Map<string, any>(),
    setTabs: (updater) =>
        set((state) => ({
            tabs: updater(new Map(state.tabs)), // Ensure a new Map is created for reactivity
        })),
}));

// Selector for better performance - only re-renders when tabs change
export function useSyncedTabsGlobalState<T>() {
    const tabs = useSyncedTabsStore((state) => state.tabs as Map<string, T>);
    const setTabs = useSyncedTabsStore((state) => state.setTabs as SyncedTabsState<T>['setTabs']);
    return [tabs, setTabs] as const;
}
