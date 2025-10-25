'use client';

import { usePathname } from 'next/navigation';
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
    const pathname = usePathname();
    const previousPathname = usePrevious(pathname);
    React.useLayoutEffect(() => {
        if (!previousHash && !previousPathname) {
            return;
        }

        // If there is no change in pathname or hash, do nothing
        if (previousHash === hash && previousPathname === pathname) {
            return;
        }

        // If there is a hash
        // - Triggered by a change of hash or pathname
        if (hash) {
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({
                    block: 'start',
                    behavior: 'smooth',
                });
                return;
            }
        }

        window.scrollTo(0, 0);
    }, [hash, previousHash, pathname, previousPathname]);
}
