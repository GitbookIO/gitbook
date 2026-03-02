'use client';

import React from 'react';

import { useHash } from './useHash';
import { usePrevious } from './usePrevious';

/**
 * Handles scroll behavior when the URL hash changes during client-side navigation.
 *
 * - If a hash is present, scrolls smoothly to the corresponding element.
 * - If the hash is removed, scrolls back to the top of the page.
 *
 * This hook only reacts to in-app navigations. It avoids interfering with:
 * - The browser's native hash scrolling on initial load
 * - Scroll-to-text fragments (which cannot be reliably detected)
 */
export function useScrollPage() {
    const hash = useHash();
    const previousHash = usePrevious(hash);

    React.useEffect(() => {
        // If there's no hash:
        // - On initial load, `previousHash` is undefined.
        //   We do nothing to avoid overriding:
        //   • Native browser hash scrolling
        //   • Scroll-to-text fragments (undetectable)
        if (previousHash === undefined) {
            return;
        }

        if (hash) {
            // Only scroll if this is not the initial render
            // and the hash actually changed.
            if (previousHash !== hash) {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({
                        block: 'start',
                        behavior: 'smooth',
                    });
                }
            }
            return;
        }

        // If the hash was removed during navigation,
        // reset scroll position to the top.
        window.scrollTo(0, 0);
    }, [hash, previousHash]);
}
