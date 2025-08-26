'use client';
import React from 'react';

export const HashContext = React.createContext<{
    hash: string | null;
    /**
     * Updates the hash value from the URL provided here.
     * It will then be used by the `useHash` hook.
     * URL can be relative or absolute.
     */
    updateHashFromUrl: (href: string) => void;
}>({
    hash: null,
    updateHashFromUrl: () => {},
});

function getHash(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.location.hash.slice(1);
}

export const HashProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [hash, setHash] = React.useState<string | null>(getHash);
    const updateHashFromUrl = React.useCallback((href: string) => {
        const url = new URL(
            href,
            typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
        );
        setHash(url.hash.slice(1));
    }, []);
    const memoizedValue = React.useMemo(
        () => ({ hash, updateHashFromUrl }),
        [hash, updateHashFromUrl]
    );
    return <HashContext.Provider value={memoizedValue}>{children}</HashContext.Provider>;
};

/**
 * Hook to get the current hash from the URL.
 * @see https://github.com/vercel/next.js/discussions/49465
 * We use a different hack than this one, because for same page link it don't work
 * We can't use the `hashChange` event because it doesn't fire for `replaceState` and `pushState` which are used by Next.js.
 * Since we have a single Link component that handles all links, we can use a context to share the hash.
 */
export function useHash() {
    // const params = useParams();
    const { hash } = React.useContext(HashContext);

    return hash;
}
