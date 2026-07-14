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

let cancelScrollToHash: (() => void) | null = null;

/**
 * Scroll to the element matching a hash during a client-side navigation.
 *
 * On a cross-page anchor link the target commits a few frames after the hash is known, and Next's
 * scroll restoration then fires a `scrollTo(0, 0)` that overrides a one-shot scroll. So retry until
 * the element exists, then re-assert briefly so GitBook scrolls last. `instant` (not `smooth`) can't
 * be interrupted mid-animation, and re-scrolling to a reached position is a no-op.
 */
function scrollToHash(hash: string) {
    cancelScrollToHash?.();

    let frame = 0;
    let framesAfterFound = 0;
    let rafId = requestAnimationFrame(function tick() {
        const element = document.getElementById(hash);
        element?.scrollIntoView({ block: 'start', behavior: 'instant' });

        // Retry ~1s for the element to commit; once found, hold ~0.3s to outlast the reset.
        if (frame++ < 60 && (!element || framesAfterFound++ < 20)) {
            rafId = requestAnimationFrame(tick);
        } else {
            cancelScrollToHash = null;
        }
    });

    cancelScrollToHash = () => cancelAnimationFrame(rafId);
}
