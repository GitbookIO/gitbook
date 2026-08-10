'use client';

import React from 'react';

const SpaceLayoutContext = React.createContext({
    basePath: '',
    siteAdaptiveAuthLoginHref: null as string | null,
    siteIndexURL: '',
});

/**
 * Provide the client context about the currently rendered space.
 */
export function SpaceLayoutContextProvider(
    props: React.PropsWithChildren<{
        basePath: string;
        siteAdaptiveAuthLoginHref?: string | null;
        siteIndexURL: string;
    }>
) {
    const { basePath, siteAdaptiveAuthLoginHref = null, siteIndexURL, children } = props;

    const value = React.useMemo(
        () => ({ basePath, siteAdaptiveAuthLoginHref, siteIndexURL }),
        [basePath, siteAdaptiveAuthLoginHref, siteIndexURL]
    );

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

/**
 * Return the site auth login path when adaptive content with login fallback is configured.
 */
export function useSiteAdaptiveAuthLoginHref() {
    const context = React.useContext(SpaceLayoutContext);
    if (!context) {
        throw new Error('SpaceLayoutContext not found');
    }
    return context.siteAdaptiveAuthLoginHref;
}

/**
 * Return the URL of the site search index (`~gitbook/site-index`).
 */
export function useSiteIndexURL() {
    const context = React.useContext(SpaceLayoutContext);
    if (!context) {
        throw new Error('SpaceLayoutContext not found');
    }
    return context.siteIndexURL;
}
