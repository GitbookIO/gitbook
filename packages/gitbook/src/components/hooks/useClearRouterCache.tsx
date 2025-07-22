'use client';
import { useContext, useEffect } from 'react';
import { LinkSettingsContext } from '../primitives';

// We cannot use a ref here because the contextId gets reset on navigation
// Probably because of this bug https://github.com/vercel/next.js/issues/67542
let previousContextId: string | undefined;

/**
 * A custom hook that clears the router cache on contextId change.
 * This is useful for ensuring that the router does not cache stale data for adaptive content.
 */
export function useClearRouterCache() {
    const { contextId } = useContext(LinkSettingsContext);
    useEffect(() => {
        if (previousContextId === undefined) {
            // On the first run, we set the previousContextId to the current contextId
            previousContextId = contextId;
            return; // Skip the first run to avoid unnecessary reload
        }
        // Initially, previousContextId will be undefined, so we only clear the cache
        // if contextId has changed from a defined value to a new value.
        // This prevents unnecessary cache clearing on the first render.
        if (contextId !== previousContextId && previousContextId !== undefined) {
            previousContextId = contextId;
            window.location.reload(); // We want to trigger a full reload to clear the in memory cache
        }
    }, [contextId]);
}

export const RouterCacheClearer = () => {
    useClearRouterCache();
    return null; // This component does not render anything, it just runs the hook
};
