'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

import { useHash } from './useHash';
import { usePrevious } from './usePrevious';

/**
 * Scroll the page to an anchor point or
 * to the top of the page when navigating between pages (pathname)
 * or sections of a page (hash).
 */
export function useScrollPage() {
    const hash = useHash();
    const previousHash = usePrevious(hash);
    const pathname = usePathname();
    const previousPathname = usePrevious(pathname);
    React.useLayoutEffect(() => {
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
            }
            return;
        }

        // If there was a hash but not anymore, scroll to top
        if (previousHash && !hash) {
            window.scrollTo(0, 0);
        }
    }, [hash, previousHash, pathname, previousPathname]);
}
