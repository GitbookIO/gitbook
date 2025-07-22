'use client';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { LinkSettingsContext } from '../primitives';

/**
 * A custom hook that clears the router cache on contextId change.
 * This is useful for ensuring that the router does not cache stale data for adaptive content.
 */
export function useClearRouterCache() {
    const { adaptiveContentHash } = useContext(LinkSettingsContext);
    const previousAdaptiveContentHash = usePrevious(adaptiveContentHash);
    const router = useRouter();

    useEffect(() => {
        if (adaptiveContentHash !== previousAdaptiveContentHash) {
            router.refresh(); // This will clear the router cache
        }
    }, [adaptiveContentHash, previousAdaptiveContentHash, router]);
}

export function usePrevious<T>(value: T): T | null {
    const [current, setCurrent] = useState(value);
    const [previous, setPrevious] = useState<T | null>(null);

    if (value !== current) {
        setPrevious(current);
        setCurrent(value);
    }

    return previous;
}

export function RouterCacheClearer() {
    useClearRouterCache();
    return null; // This component does not render anything, it just runs the hook
}
