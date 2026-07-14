'use client';

import React from 'react';

import { usePathname } from 'next/navigation';
import { useHash } from './useHash';
import { usePrevious } from './usePrevious';

const SCROLL_PAGE_INITIAL_LOAD_KEY = '__gitbookScrollPageInitialLoadHandled';

type ScrollPageWindow = Window & {
    [SCROLL_PAGE_INITIAL_LOAD_KEY]?: boolean;
};

/**
 * Check if it's an initial page load outside of React tree.
 */
function isInitialPageLoad() {
    const scrollPageWindow = window as ScrollPageWindow;
    if (scrollPageWindow[SCROLL_PAGE_INITIAL_LOAD_KEY]) {
        return false;
    }

    scrollPageWindow[SCROLL_PAGE_INITIAL_LOAD_KEY] = true;
    return true;
}

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
        if (previous === undefined) {
            // If previous is undefined, we rely on a check outside React tree,
            // sections are remounting everything so we can't rely on React.
            if (isInitialPageLoad()) {
                return;
            }
        } else if (previous.hash === hash && previous.pathname === pathname) {
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

let scrollToHashFrame: number | null = null;

/**
 * Scroll to the element matching a hash.
 *
 * On a soft navigation to another page the hash is known (set on link click) before the
 * destination content commits to the DOM, so the target element is often missing on the first
 * attempt. Rather than give up — which left cross-page anchor links stuck at the top of the page —
 * retry across animation frames (bounded) until the element appears.
 */
function scrollToHash(hash: string) {
    if (scrollToHashFrame !== null) {
        cancelAnimationFrame(scrollToHashFrame);
        scrollToHashFrame = null;
    }

    // ~1s at 60fps: enough for a prefetched page to commit, short enough not to hijack the
    // scroll long after the user has moved on.
    let remainingFrames = 60;

    const attempt = () => {
        const element = document.getElementById(hash);
        if (element) {
            element.scrollIntoView({
                block: 'start',
                behavior: 'smooth',
            });
            scrollToHashFrame = null;
            return;
        }

        if (remainingFrames-- <= 0) {
            scrollToHashFrame = null;
            return;
        }

        scrollToHashFrame = requestAnimationFrame(attempt);
    };

    attempt();
}
