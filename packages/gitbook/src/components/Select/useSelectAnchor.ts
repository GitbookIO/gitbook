'use client';

import { useHash } from '@/components/hooks';
import { SELECT_OPTION_ATTR, selectStore } from '@/lib/select';
import { useLayoutEffect } from 'react';

/**
 * Make anchors work across `select` variants: when the URL points at an element inside an inactive
 * pane (e.g. a heading in a non-selected tab), activate the slugs of its `data-select-option`
 * ancestors so the pane becomes visible, then scroll to it after the panes reflow.
 *
 * Runs once globally (mounted by SelectProvider) so nested groups resolve in a single pass — the
 * outermost pane is activated first, leaving the innermost (the actual target) most-recent.
 */
export function useSelectAnchor() {
    const hash = useHash();

    useLayoutEffect(() => {
        if (!hash) {
            return;
        }
        const target = document.getElementById(hash);
        if (!target) {
            return;
        }

        const slugs: string[] = [];
        let node: Element | null = target.closest(`[${SELECT_OPTION_ATTR}]`);
        while (node) {
            const slug = node.getAttribute(SELECT_OPTION_ATTR);
            if (slug) {
                slugs.push(slug);
            }
            node = node.parentElement?.closest(`[${SELECT_OPTION_ATTR}]`) ?? null;
        }

        if (slugs.length === 0) {
            return;
        }

        // Outermost first, so the innermost target ends up most-recent and wins in its group.
        for (let i = slugs.length - 1; i >= 0; i--) {
            const slug = slugs[i];
            if (slug) {
                selectStore.activate(slug);
            }
        }

        requestAnimationFrame(() => {
            target.scrollIntoView({ block: 'start', behavior: 'instant' });
        });
    }, [hash]);
}
