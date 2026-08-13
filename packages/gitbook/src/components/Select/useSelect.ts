'use client';

import { selectStore } from '@/lib/select';
import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribe to the site-wide `select` state. Returns the current recency list plus the setters.
 * Consumers that only need "which of my options is active" should prefer {@link useResolvedSlug}.
 */
export function useSelect() {
    const slugs = useSyncExternalStore(
        selectStore.subscribe,
        selectStore.getState,
        selectStore.getState
    ).slugs;

    return {
        slugs,
        activate: selectStore.activate,
        deactivate: selectStore.deactivate,
    };
}

/**
 * Resolve which of a block's candidate slugs is active, falling back to `defaultSlug`. Recomputes
 * whenever the selection changes.
 */
export function useResolvedSlug(candidateSlugs: string[], defaultSlug: string | null = null) {
    // `candidateSlugs` is a fresh array each render; key on its contents to keep the snapshot stable.
    const key = candidateSlugs.join(',');
    const getResolved = useCallback(() => {
        const candidates = key ? key.split(',') : [];
        return selectStore.resolveActiveSlug(candidates) ?? defaultSlug;
    }, [key, defaultSlug]);
    return useSyncExternalStore(selectStore.subscribe, getResolved, getResolved);
}
