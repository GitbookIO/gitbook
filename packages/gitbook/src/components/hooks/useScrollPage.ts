'use client';

import React from 'react';

import { useHash } from './useHash';
import { usePrevious } from './usePrevious';

/**
 * Scroll the page to the hash or reset scroll to the top.
 * Only triggered while navigating in the app, not for initial load.
 */
export function useScrollPage() {
    const hash = useHash();
    const previousHash = usePrevious(hash);

    React.useEffect(() => {
        if (hash) {
            if (previousHash !== undefined && previousHash !== hash) {
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

        // On initial load `previousHash` can be undefined,
        // but if the URL contains a fragment (hash),
        // we don't override native anchor scrolling
        if (!previousHash && window.location.hash) {
            return;
        }

        window.scrollTo(0, 0);
    }, [hash, previousHash]);
}
