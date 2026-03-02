'use client';

import React from 'react';

import { usePathname } from 'next/navigation';
import { useHash } from './useHash';
import { usePrevious } from './usePrevious';

/**
 * Handles scroll behavior when the URL hash changes during client-side navigation.
 */
function useScrollPage() {
    const hash = useHash();
    const pathname = usePathname();
    const previous = usePrevious({ pathname, hash });

    React.useEffect(() => {
        // Never scroll on initial rendering to avoid blocking:
        // • Native browser hash scrolling
        // • Scroll-to-text fragments (undetectable)
        if (previous === undefined || (previous.hash === hash && previous.pathname === pathname)) {
            return;
        }

        if (hash) {
            scrollToHash(hash);
            return;
        }

        window.scrollTo(0, 0);
    }, [hash, pathname, previous]);
}

/**
 * Handles scroll behavior when the URL hash changes during client-side navigation.
 */
export function ScrollPage() {
    useScrollPage();
    return null;
}

/**
 * Scroll to the hash if present.
 */
export function useScrollToHash() {
    const hash = useHash();

    React.useEffect(() => {
        if (hash) {
            scrollToHash(hash);
        }
    }, [hash]);
}

/**
 * Scroll to a hash, if scroll didn't work, return false.
 */
function scrollToHash(hash: string) {
    const element = document.getElementById(hash);
    if (element) {
        element.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
        });
        return true;
    }
    return false;
}
