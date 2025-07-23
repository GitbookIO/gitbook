'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// We don't export this context directly, you are supposed to use one of the hooks or components provided by this file.
const LoadingStateProviderContext = createContext<{
    bodyLoaded: boolean;
    setBodyLoaded: (loaded: boolean) => void;
}>({
    bodyLoaded: false,
    setBodyLoaded: () => {},
});

/**
 * A provider that tracks the loading state of the body.
 * This is used to determine when the body has finished loading.
 * If we need to track more loading states in the future, we can extend this context.
 */
export function LoadingStateProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [bodyLoadedState, setBodyLoaded] = useState(false);

    const bodyLoaded = useMemo(() => bodyLoadedState, [bodyLoadedState]);

    return (
        <LoadingStateProviderContext.Provider value={{ bodyLoaded, setBodyLoaded }}>
            {children}
        </LoadingStateProviderContext.Provider>
    );
}

/** * Hook to get the current loading state of the body.
 * Returns true if the body has finished loading inside the suspense boundary.
 */
export function useBodyLoaded() {
    const context = useContext(LoadingStateProviderContext);
    return useMemo(() => context.bodyLoaded, [context.bodyLoaded]);
}

/**
 * A component that sets the body as loaded when it is mounted.
 * It should be used inside a Suspense boundary to indicate that the body has finished loading.
 */
export function SuspenseLoadedHint() {
    const context = useContext(LoadingStateProviderContext);
    useEffect(() => {
        context.setBodyLoaded(true);
    }, [context]);
    return null;
}
