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
 * Scroll to the element matching a hash, robustly, during a client-side navigation.
 *
 * Two things fight a naive one-shot scroll on a cross-page anchor link (`/page#heading`):
 *   1. The hash is known on link click, before the destination content commits, so the target
 *      element doesn't exist yet on the first attempt.
 *   2. Next's scroll restoration fires a `window.scrollTo(0, 0)` *after* the destination commits,
 *      overriding a single `scrollIntoView` and leaving the page at the top.
 * So we retry until the element exists, then keep re-asserting the scroll for a short window to win
 * against that late reset — bailing immediately if the user scrolls, so we never hijack their intent.
 */
function scrollToHash(hash: string) {
    cancelScrollToHash?.();

    // ~1s to wait for the element to commit; ~0.3s of re-asserting once it has.
    const maxFramesToFind = 60;
    const framesToHoldAfterFound = 20;

    let frame = 0;
    let framesSinceFound = 0;
    let rafId: number | null = null;
    let aborted = false;

    const onUserScroll = () => {
        aborted = true;
    };

    const cleanup = () => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        window.removeEventListener('wheel', onUserScroll);
        window.removeEventListener('touchmove', onUserScroll);
        window.removeEventListener('keydown', onUserScroll);
        cancelScrollToHash = null;
    };
    cancelScrollToHash = cleanup;

    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    window.addEventListener('keydown', onUserScroll);

    const tick = () => {
        if (aborted) {
            cleanup();
            return;
        }

        const element = document.getElementById(hash);
        if (element) {
            // `instant` (not `smooth`): a smooth animation is easily interrupted by the competing
            // scroll reset, and re-asserting an instant scroll to a position already reached is a
            // no-op, so holding costs nothing.
            element.scrollIntoView({ block: 'start', behavior: 'instant' });
            if (framesSinceFound++ >= framesToHoldAfterFound) {
                cleanup();
                return;
            }
        } else if (frame >= maxFramesToFind) {
            cleanup();
            return;
        }

        frame++;
        rafId = requestAnimationFrame(tick);
    };

    tick();
}
