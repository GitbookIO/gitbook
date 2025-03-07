'use client';

import React from 'react';

const SpaceLayoutContext = React.createContext({
    basePath: '',
});

/**
 * Provide the client context about the currently rendered space.
 */
export function SpaceLayoutContextProvider(
    props: React.PropsWithChildren<{
        basePath: string;
    }>
) {
    const { basePath, children } = props;

    const value = React.useMemo(() => ({ basePath }), [basePath]);

    return <SpaceLayoutContext.Provider value={value}>{children}</SpaceLayoutContext.Provider>;
}

/**
 * Return the base path of the currently rendered space.
 */
export function useSpaceBasePath() {
    const context = React.useContext(SpaceLayoutContext);
    if (!context) {
        throw new Error('SpaceLayoutContext not found');
    }
    return context.basePath;
}
