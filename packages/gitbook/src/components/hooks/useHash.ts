'use client';

import { useCallback, useEffect, useState } from 'react';

// How do I get the pathname with hash.
// source: https://github.com/vercel/next.js/discussions/49465
export function useHash() {
    const getCurrentHash = useCallback(
        () => (typeof window !== 'undefined' ? window.location.hash.replace(/^#!?/, '') : ''),
        []
    );
    const [hash, setHash] = useState<string>(getCurrentHash());

    useEffect(() => {
        const handleHashChange = () => {
            setHash(getCurrentHash());
        };
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [getCurrentHash]);

    return hash;
}
