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

        // For a same-page anchor the context `hash` is authoritative (set on click, before Next
        // commits the URL). For a cross-page navigation the context hash is transiently empty while
        // the section remounts, so read the committed URL instead.
        const samePage = previous !== undefined && previous.pathname === pathname;
        const targetHash = samePage ? hash : window.location.hash.slice(1);

        if (targetHash) {
            scrollToHash(targetHash);
            return;
        }

        // No hash: cancel any in-flight scroll-to-hash from a previous navigation so it can't fight
        // this one. Next handles the actual scroll-to-top of the new page.
        cancelScrollToHash?.();
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

/** Cancels an in-flight {@link scrollToHash} run, if any. */
let cancelScrollToHash: (() => void) | null = null;

/** Treat a navigation as settled — and stop re-asserting the scroll — once the DOM is quiet this long. */
const SCROLL_TO_HASH_SETTLE_MS = 400;

/**
 * Scroll to the element matching a hash after a client-side navigation.
 *
 * A soft navigation delivers the destination asynchronously: its content keeps mounting and reflowing
 * for a few hundred ms after the URL changes, so a single scroll lands before the target reaches its
 * final position. Re-scroll on every DOM change until it goes quiet — mirroring the fragment scrolling
 * the browser does for free during a full page load. Bail if the visitor scrolls, so we never fight
 * them. (`instant` so re-scrolling to an already-reached position is a no-op.)
 */
function scrollToHash(hash: string) {
    cancelScrollToHash?.();

    let settleTimer = 0;
    const stop = () => {
        observer.disconnect();
        window.clearTimeout(settleTimer);
        window.removeEventListener('wheel', stop);
        window.removeEventListener('touchmove', stop);
        cancelScrollToHash = null;
    };

    const reassert = () => {
        document.getElementById(hash)?.scrollIntoView({ block: 'start', behavior: 'instant' });
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(stop, SCROLL_TO_HASH_SETTLE_MS);
    };

    // Our own `scrollIntoView` dispatches `scroll`, not `wheel`/`touchmove`, so it can't self-cancel.
    const observer = new MutationObserver(reassert);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });

    reassert();
    cancelScrollToHash = stop;
}
