'use client';

import React from 'react';

import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';

const STORAGE_KEY = '@gitbook/searchLastQuery';
const EMPTY_LAST_QUERY_STATE: LastQueryState = {};

type LastQueryState = Record<string, string>;

const listeners = new Set<() => void>();

let globalLastQueryState = EMPTY_LAST_QUERY_STATE;
let hasStorageListener = false;
let hasLoadedLastQueryState = false;

function sanitizeState(value: unknown): LastQueryState {
    if (!value || typeof value !== 'object') {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).flatMap(([siteSpaceId, query]) => {
            if (typeof query !== 'string') {
                return [];
            }

            const normalizedQuery = query.trim();
            return siteSpaceId && normalizedQuery ? [[siteSpaceId, normalizedQuery]] : [];
        })
    );
}

function readLastQueryState(): LastQueryState {
    return sanitizeState(getLocalStorageItem<unknown>(STORAGE_KEY, {}));
}

function ensureLastQueryStateLoaded() {
    if (typeof window === 'undefined' || hasLoadedLastQueryState) {
        return;
    }

    globalLastQueryState = readLastQueryState();
    hasLoadedLastQueryState = true;
}

function emitChange() {
    listeners.forEach((listener) => listener());
}

function ensureStorageListener() {
    if (typeof window === 'undefined' || hasStorageListener) {
        return;
    }

    ensureLastQueryStateLoaded();

    window.addEventListener('storage', () => {
        globalLastQueryState = readLastQueryState();
        hasLoadedLastQueryState = true;
        emitChange();
    });
    hasStorageListener = true;
}

function writeLastQueryState(nextState: LastQueryState) {
    globalLastQueryState = nextState;
    setLocalStorageItem(STORAGE_KEY, nextState);
    emitChange();
}

export function getLastSearchQuery(siteSpaceId: string): string | null {
    ensureLastQueryStateLoaded();
    return globalLastQueryState[siteSpaceId] ?? null;
}

export function setLastSearchQuery(siteSpaceId: string, query: string | null): void {
    if (!siteSpaceId) {
        return;
    }

    ensureLastQueryStateLoaded();

    const normalizedQuery = query?.trim() ?? '';
    const nextState = { ...globalLastQueryState };

    if (normalizedQuery) {
        nextState[siteSpaceId] = normalizedQuery;
    } else {
        delete nextState[siteSpaceId];
    }

    writeLastQueryState(nextState);
}

export function useLastSearchQuery(siteSpaceId: string): string | null {
    const subscribe = React.useCallback((listener: () => void) => {
        ensureStorageListener();
        listeners.add(listener);
        listener();
        return () => listeners.delete(listener);
    }, []);

    const getSnapshot = React.useCallback(
        () => globalLastQueryState[siteSpaceId] ?? null,
        [siteSpaceId]
    );

    return React.useSyncExternalStore(subscribe, getSnapshot, () => null);
}
