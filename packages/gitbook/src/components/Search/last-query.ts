'use client';

import React from 'react';

type LastSearchQueryBySiteSpace = Record<string, string>;

const listeners = new Set<() => void>();

let globalLastSearchQuery: LastSearchQueryBySiteSpace = {};

function emitChange() {
    listeners.forEach((listener) => listener());
}

export function getLastSearchQuery(siteSpaceId: string): string | null {
    return globalLastSearchQuery[siteSpaceId] ?? null;
}

export function setLastSearchQuery(siteSpaceId: string, query: string | null): void {
    if (!siteSpaceId) {
        return;
    }

    const normalizedQuery = query?.trim() || null;
    const nextState = { ...globalLastSearchQuery };

    if (normalizedQuery) {
        nextState[siteSpaceId] = normalizedQuery;
    } else {
        delete nextState[siteSpaceId];
    }

    globalLastSearchQuery = nextState;
    emitChange();
}

export function clearLastSearchQuery(siteSpaceId: string): void {
    setLastSearchQuery(siteSpaceId, null);
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function useLastSearchQuery(siteSpaceId: string): string | null {
    return React.useSyncExternalStore(
        subscribe,
        () => globalLastSearchQuery[siteSpaceId] ?? null,
        () => null
    );
}
