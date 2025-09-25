'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export const NavigationStatusContext = React.createContext<{
    hash: string | null;
    /**
     * Updates the navigation state from the URL provided here.
     * URL can be relative or absolute.
     */
    onNavigationClick: (href: string) => void;
    /**
     * Indicates if a link has been clicked recently.
     * Becomes true after a click and resets to false when pathname changes.
     * It is debounced to avoid flickering on fast navigations.
     * Debounce time is 400ms (= doherty threshold for responsiveness).
     */
    isNavigating: boolean;
}>({
    hash: null,
    onNavigationClick: () => {},
    isNavigating: false,
});

function getHash(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.location.hash.slice(1);
}

export const NavigationStatusProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [hash, setHash] = React.useState<string | null>(getHash);
    const [isNavigating, setIsNavigating] = React.useState(false);
    const timeoutRef = React.useRef<number | null>(null);
    const pathname = usePathname();
    const pathnameRef = React.useRef(pathname);

    // Reset isNavigating when pathname changes
    React.useEffect(() => {
        if (pathnameRef.current !== pathname) {
            setIsNavigating(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            pathnameRef.current = pathname;
        }
    }, [pathname]);

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const onNavigationClick = React.useCallback((href: string) => {
        // We need to skip it for search like params (i.e. ?ask= or ?q=) because they don't really trigger a navigation
        // Search may trigger a navigation whenn clicking on the ask ai for example, this is not something we want to track here
        if (href.startsWith('?') || href.startsWith('#')) {
            return;
        }
        const url = new URL(
            href,
            typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
        );
        setHash(url.hash.slice(1));

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (pathnameRef.current !== url.pathname) {
            timeoutRef.current = window.setTimeout(() => {
                setIsNavigating(true);
                timeoutRef.current = null;
                return;
            }, 400); // 400ms timeout - doherty threshold for responsiveness
        }
    }, []);

    const memoizedValue = React.useMemo(
        () => ({ hash, onNavigationClick, isNavigating }),
        [hash, onNavigationClick, isNavigating]
    );
    return (
        <NavigationStatusContext.Provider value={memoizedValue}>
            {children}
        </NavigationStatusContext.Provider>
    );
};

/**
 * Hook to get the current hash from the URL.
 * @see https://github.com/vercel/next.js/discussions/49465
 * We use a different hack than this one, because for same page link it don't work
 * We can't use the `hashChange` event because it doesn't fire for `replaceState` and `pushState` which are used by Next.js.
 * Since we have a single Link component that handles all links, we can use a context to share the hash.
 */
export function useHash() {
    const { hash } = React.useContext(NavigationStatusContext);

    return hash;
}

/**
 * Hook to get the current navigation state.
 * @returns True if a navigation has been triggered recently. False otherwise, it also resets to false when the navigation is complete.
 */
export function useIsNavigating() {
    const { isNavigating: hasBeenClicked } = React.useContext(NavigationStatusContext);
    return hasBeenClicked;
}
