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
    const pathname = usePathname();

    // Depend on `pathname` as well as `hash`: on a soft navigation to another page
    // (e.g. a homepage card linking to `/page#heading`), the hash is set on click while
    // the previous page is still mounted, so a hash-only effect fires before the target
    // element exists. Because sibling pages share the same `[pagePath]` route, this hook's
    // host component is reused rather than remounted, so it would otherwise never re-run
    // once the destination content commits. Re-running on `pathname` re-attempts the scroll
    // when the target heading is finally in the DOM.
    React.useEffect(() => {
        if (hash) {
            scrollToHash(hash);
        }
    }, [hash, pathname]);
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
