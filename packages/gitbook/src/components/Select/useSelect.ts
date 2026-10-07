'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { selectStore } from '@/lib/select';

/**
 * Setters for the site-wide `select` state. Deliberately does not subscribe: the store notifies on
 * every activation anywhere on the page, so returning the recency list here would re-render every
 * block that only ever wanted to *write* a selection. To read one, use {@link useResolvedSlug},
 * which re-renders a block only when its own resolved option changes.
 */
export function useSelect() {
    return {
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
