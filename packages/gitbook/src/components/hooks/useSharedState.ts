import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';
import React from 'react';

interface DocState {
    active: string[];
}

const initialState: DocState = {
    active: [],
};

let globalState = getLocalStorageItem('@gitbook/docState', initialState);
const listeners = new Set<() => void>();

export function useSharedState() {
    // synx external store
    const subscribe = React.useCallback((callback: () => void) => {
        listeners.add(callback);
        return () => {
            listeners.delete(callback);
        };
    }, []);

    const getSnapshot = React.useCallback(() => globalState, []);

    const setState = React.useCallback((updater: (prevState: DocState) => DocState) => {
        globalState = updater(globalState);
        setLocalStorageItem('@gitbook/docState', globalState);
        listeners.forEach((listener) => listener());
    }, []);

    const state = React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return [state, setState] as const;
}
