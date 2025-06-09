import { useSyncExternalStore } from 'react';

/**
 * Hook to check if the screen is mobile
 * @default breakpoint => 1024
 */
export function useIsMobile(breakpoint = 1024) {
    const store = getMediaQueryStore(breakpoint);

    return useSyncExternalStore(
        (cb) => {
            store.subscribers.add(cb);
            return () => store.subscribers.delete(cb);
        },
        () => store.isMatch,
        () => false
    );
}

type MediaQueryStore = {
    /** Latest match result */
    isMatch: boolean;
    /** The native MediaQueryList object */
    mediaQueryList: MediaQueryList;
    /** React subscribers that need re-rendering on change */
    subscribers: Set<() => void>;
};

const mediaQueryStores: Record<string, MediaQueryStore> = {};

/**
 * getMediaQueryStore("(max-width: 1024px)")
 * Returns a singleton store for that query,
 * creating it (and its listener) the first time.
 */
function getMediaQueryStore(breakpoint: number): MediaQueryStore {
    // If the store already exists, return it
    if (mediaQueryStores[breakpoint]) return mediaQueryStores[breakpoint];

    const queryString = `(max-width: ${breakpoint - 0.1}px)`;
    const mqList =
        typeof window !== 'undefined' ? window.matchMedia(queryString) : ({} as MediaQueryList);

    const store: MediaQueryStore = {
        isMatch: typeof window !== 'undefined' ? mqList.matches : false,
        mediaQueryList: mqList,
        subscribers: new Set(),
    };

    const update = () => {
        store.isMatch = mqList.matches;
        store.subscribers.forEach((cb) => cb());
    };

    if (mqList.addEventListener) mqList.addEventListener('change', update);
    // For Safari < 14
    else if (mqList.addListener) mqList.addListener(update);

    mediaQueryStores[breakpoint] = store;
    return store;
}
