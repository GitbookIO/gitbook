'use client';

import { useParams } from 'next/navigation';
import React from 'react';

function getHash(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.location.hash.slice(1);
}

/**
 * Hook to get the current hash from the URL.
 * @see https://github.com/vercel/next.js/discussions/49465
 */
export function useHash() {
    const params = useParams();
    const [hash, setHash] = React.useState<string | null>(getHash);
    React.useEffect(() => {
        setHash(getHash());
    }, [params]);
    return hash;
}
