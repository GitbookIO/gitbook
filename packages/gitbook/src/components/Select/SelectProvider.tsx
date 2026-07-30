'use client';

import { SELECT_URL_PARAM, selectStore } from '@/lib/select';
import { parseAsString, useQueryState } from 'nuqs';
import type React from 'react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSelect } from './useSelect';
import { useSelectAnchor } from './useSelectAnchor';

// `useLayoutEffect` runs before paint but warns during SSR (effects don't run on the server anyway),
// so fall back to `useEffect` there.
const useIsomorphicLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

function parseSelectParam(value: string | null): string[] {
    if (!value) {
        return [];
    }
    return value
        .split(',')
        .map((slug) => slug.trim())
        .filter(Boolean);
}

/**
 * Wires the `select` store to the `?select=` URL param and hydrates it from localStorage. Mounted
 * once at the site layout level (inside NuqsAdapter). Provides no React context — the store is a
 * module singleton — so it simply renders its children.
 */
export function SelectProvider(props: { children: React.ReactNode }) {
    const [param, setParam] = useQueryState(SELECT_URL_PARAM, parseAsString);
    const { slugs } = useSelect();
    // The last value we wrote to the URL, so we can tell our own writes apart from external ones.
    const mirroredRef = useRef<string | null>(null);

    useSelectAnchor();

    // Adopt whatever the pre-paint script already merged (URL + storage) into the in-memory store.
    // Layout effect so the store (and the tab highlight it drives) is settled before first paint,
    // matching the `<html data-sel-*>` the pre-paint script already applied.
    useIsomorphicLayoutEffect(() => {
        selectStore.init();
    }, []);

    // URL → store: a shared link or client-side navigation carrying ?select= prepends its slugs, so
    // the link wins while the visitor's other preferences survive.
    useEffect(() => {
        if (param === mirroredRef.current) {
            return;
        }
        const fromUrl = parseSelectParam(param);
        if (fromUrl.length > 0) {
            selectStore.setSlugs([...fromUrl, ...selectStore.getState().slugs]);
        }
    }, [param]);

    // store → URL: keep ?select= as a shareable mirror of the recency list (replaceState, no history spam).
    useEffect(() => {
        const desired = slugs.length > 0 ? slugs.join(',') : null;
        if ((param ?? null) === desired) {
            return;
        }
        mirroredRef.current = desired;
        setParam(desired);
    }, [slugs, param, setParam]);

    return props.children;
}
