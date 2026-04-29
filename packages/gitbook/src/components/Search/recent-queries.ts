'use client';

import React from 'react';

import { getLocalStorageItem, setLocalStorageItem } from '@/lib/browser';

const STORAGE_KEY = '@gitbook/searchRecentQueries';
const MAX_RECENT_QUERIES = 5;
const EMPTY_RECENT_QUERIES: RecentSearchQueryEntry[] = [];

export type RecentSearchQueryAction = 'ask' | 'search';

export type RecentSearchQueryEntry = {
    query: string;
    action: RecentSearchQueryAction;
};

type RecentQueriesState = Record<string, RecentSearchQueryEntry[]>;

const listeners = new Set<() => void>();
const EMPTY_RECENT_QUERIES_STATE: RecentQueriesState = {};

let globalRecentQueriesState = EMPTY_RECENT_QUERIES_STATE;
let hasStorageListener = false;

function parseRecentSearchQueryEntry(value: unknown): RecentSearchQueryEntry | null {
    if (
        !value ||
        typeof value !== 'object' ||
        !('query' in value) ||
        typeof value.query !== 'string' ||
        !('action' in value) ||
        (value.action !== 'ask' && value.action !== 'search')
    ) {
        return null;
    }

    const query = value.query.trim();
    if (!query) {
        return null;
    }

    return {
        query,
        action: value.action,
    };
}

function sanitizeQueries(value: unknown): RecentSearchQueryEntry[] {
    if (!Array.isArray(value)) {
        return EMPTY_RECENT_QUERIES;
    }

    const seen = new Set<string>();

    return value.reduce<RecentSearchQueryEntry[]>((acc, entry) => {
        const normalizedEntry = parseRecentSearchQueryEntry(entry);
        if (!normalizedEntry || seen.has(normalizedEntry.query)) {
            return acc;
        }

        seen.add(normalizedEntry.query);
        if (acc.length < MAX_RECENT_QUERIES) {
            acc.push(normalizedEntry);
        }
        return acc;
    }, []);
}

function sanitizeState(value: unknown): RecentQueriesState {
    if (!value || typeof value !== 'object') {
        return {};
    }

    return Object.fromEntries(
        Object.entries(value).flatMap(([siteSpaceId, queries]) => {
            if (typeof siteSpaceId !== 'string') {
                return [];
            }

            const sanitized = sanitizeQueries(queries);
            return sanitized.length > 0 ? [[siteSpaceId, sanitized]] : [];
        })
    );
}

function readRecentQueriesState(): RecentQueriesState {
    return sanitizeState(getLocalStorageItem<unknown>(STORAGE_KEY, {}));
}

function emitChange() {
    listeners.forEach((listener) => listener());
}

function ensureStorageListener() {
    if (typeof window === 'undefined' || hasStorageListener) {
        return;
    }

    globalRecentQueriesState = readRecentQueriesState();

    window.addEventListener('storage', () => {
        globalRecentQueriesState = readRecentQueriesState();
        emitChange();
    });
    hasStorageListener = true;
}

function writeRecentQueriesState(nextState: RecentQueriesState) {
    globalRecentQueriesState = nextState;
    setLocalStorageItem(STORAGE_KEY, nextState);
    emitChange();
}

export function addRecentSearchQuery(
    siteSpaceId: string,
    query: string,
    action: RecentSearchQueryAction
) {
    const normalizedQuery = query.trim();
    if (!siteSpaceId || !normalizedQuery) {
        return;
    }

    const nextQueries: RecentSearchQueryEntry[] = [
        {
            query: normalizedQuery,
            action,
        },
        ...(globalRecentQueriesState[siteSpaceId] ?? []).filter(
            (existingQuery) => existingQuery.query !== normalizedQuery
        ),
    ].slice(0, MAX_RECENT_QUERIES);

    writeRecentQueriesState({
        ...globalRecentQueriesState,
        [siteSpaceId]: nextQueries,
    });
}

export function useRecentSearchQueries(siteSpaceId: string): RecentSearchQueryEntry[] {
    const subscribe = React.useCallback((listener: () => void) => {
        ensureStorageListener();
        listeners.add(listener);
        listener();
        return () => listeners.delete(listener);
    }, []);

    const getSnapshot = React.useCallback(
        () => globalRecentQueriesState[siteSpaceId] ?? EMPTY_RECENT_QUERIES,
        [siteSpaceId]
    );

    return React.useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_RECENT_QUERIES);
}
