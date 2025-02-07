import React from 'react';

let globalState: Record<string, string> = {};
const listeners = new Set<() => void>();

export function useSyncedTabsGlobalState() {
    const subscribe = React.useCallback((callback: () => void) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
    }, []);

    const getSnapshot = React.useCallback(() => globalState, []);

    const setSyncedTabs = React.useCallback(
        (updater: (tabs: Record<string, string>) => Record<string, string>) => {
            globalState = updater(globalState);
            listeners.forEach((listener) => listener());
        },
        [],
    );

    const tabs = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    return [tabs, setSyncedTabs] as const;
}
