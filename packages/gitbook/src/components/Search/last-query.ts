'use client';

import React from 'react';

import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';

const STORAGE_KEY = '@gitbook/searchLastQuery';

export type LastSearchState = {
    q: string | null;
    ask: string | null;
};

type LastSearchStateBySiteSpace = Record<string, LastSearchState>;

const EMPTY_LAST_SEARCH_STATE: LastSearchState = { q: null, ask: null };
const EMPTY_LAST_SEARCH_STATE_BY_SITE_SPACE: LastSearchStateBySiteSpace = {};

const listeners = new Set<() => void>();

let globalLastSearchState = EMPTY_LAST_SEARCH_STATE_BY_SITE_SPACE;
let hasStorageListener = false;
let hasLoadedLastSearchState = false;

function normalizeValue(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const normalizedValue = value.trim();
    return normalizedValue || null;
}

function normalizeEntry(value: unknown): LastSearchState {
    // Migrate the original per-site string format to the new q/ask format.
    if (typeof value === 'string') {
        return { q: normalizeValue(value), ask: null };
    }

    if (!value || typeof value !== 'object') {
        return EMPTY_LAST_SEARCH_STATE;
    }

    const entry = value as Record<string, unknown>;
    return {
        q: normalizeValue(entry.q),
        ask: normalizeValue(entry.ask),
    };
}

export function sanitizeLastSearchState(value: unknown): LastSearchStateBySiteSpace {
    if (!value || typeof value !== 'object') {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).flatMap(([siteSpaceId, entry]) => {
            const normalizedEntry = normalizeEntry(entry);
            return siteSpaceId && (normalizedEntry.q || normalizedEntry.ask)
                ? [[siteSpaceId, normalizedEntry]]
                : [];
        })
    );
}

export function resolveSearchValue(
    urlState: LastSearchState,
    storedState: LastSearchState
): string | null {
    return urlState.q ?? storedState.q ?? urlState.ask ?? storedState.ask ?? null;
}

function readLastSearchState(): LastSearchStateBySiteSpace {
    return sanitizeLastSearchState(getLocalStorageItem<unknown>(STORAGE_KEY, {}));
}

function ensureLastSearchStateLoaded() {
    if (typeof window === 'undefined' || hasLoadedLastSearchState) {
        return;
    }

    globalLastSearchState = readLastSearchState();
    hasLoadedLastSearchState = true;
}

function emitChange() {
    listeners.forEach((listener) => listener());
}

function ensureStorageListener() {
    if (typeof window === 'undefined' || hasStorageListener) {
        return;
    }

    ensureLastSearchStateLoaded();

    window.addEventListener('storage', () => {
        globalLastSearchState = readLastSearchState();
        hasLoadedLastSearchState = true;
        emitChange();
    });
    hasStorageListener = true;
}

function writeLastSearchState(nextState: LastSearchStateBySiteSpace) {
    globalLastSearchState = nextState;
    setLocalStorageItem(STORAGE_KEY, nextState);
    emitChange();
}

export function getLastSearchState(siteSpaceId: string): LastSearchState {
    ensureLastSearchStateLoaded();
    return globalLastSearchState[siteSpaceId] ?? EMPTY_LAST_SEARCH_STATE;
}

export function setLastSearchState(siteSpaceId: string, state: LastSearchState): void {
    if (!siteSpaceId) {
        return;
    }

    ensureLastSearchStateLoaded();

    const normalizedState = normalizeEntry(state);
    const nextState = { ...globalLastSearchState };

    if (normalizedState.q || normalizedState.ask) {
        nextState[siteSpaceId] = normalizedState;
    } else {
        delete nextState[siteSpaceId];
    }

    writeLastSearchState(nextState);
}

export function clearLastSearchState(siteSpaceId: string): void {
    setLastSearchState(siteSpaceId, EMPTY_LAST_SEARCH_STATE);
}

export function useLastSearchState(siteSpaceId: string): LastSearchState {
    const subscribe = React.useCallback((listener: () => void) => {
        ensureStorageListener();
        listeners.add(listener);
        listener();
        return () => listeners.delete(listener);
    }, []);

    const getSnapshot = React.useCallback(
        () => globalLastSearchState[siteSpaceId] ?? EMPTY_LAST_SEARCH_STATE,
        [siteSpaceId]
    );

    return React.useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_LAST_SEARCH_STATE);
}
