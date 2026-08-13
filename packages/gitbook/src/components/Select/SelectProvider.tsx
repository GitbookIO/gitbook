'use client';

import { selectStore } from '@/lib/select';
import type React from 'react';
import { useEffect, useLayoutEffect } from 'react';
import { useSelectAnchor } from './useSelectAnchor';

// `useLayoutEffect` runs before paint but warns during SSR (effects don't run on the server anyway),
// so fall back to `useEffect` there.
const useIsomorphicLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Hydrates the `select` store from localStorage. Mounted once at the site layout level. Provides no
 * React context — the store is a module singleton — so it simply renders its children.
 */
export function SelectProvider(props: { children: React.ReactNode }) {
    // Adopt what the pre-paint script already applied, before paint, so the store (and the tab
    // highlight it drives) agrees with the `<html data-sel-*>` on the page.
    // Must stay registered before `useSelectAnchor`, whose effect can activate slugs: a write before
    // hydration would persist over the visitor's stored list instead of merging into it.
    useIsomorphicLayoutEffect(() => {
        selectStore.init();
    }, []);

    useSelectAnchor();

    return props.children;
}
