'use client';

import React from 'react';

const SpaceLayoutContext = React.createContext({
    basePath: '',
    siteAdaptiveAuthLoginHref: null as string | null,
    isLoggedInVisitor: false,
    siteIndexURL: '',
});

/**
 * Provide the client context about the currently rendered space.
 */
export function SpaceLayoutContextProvider(
    props: React.PropsWithChildren<{
        basePath: string;
        siteAdaptiveAuthLoginHref?: string | null;
        isLoggedInVisitor?: boolean;
        siteIndexURL: string;
    }>
) {
    const {
        basePath,
        siteAdaptiveAuthLoginHref = null,
        isLoggedInVisitor = false,
        siteIndexURL,
        children,
    } = props;

    const value = React.useMemo(
        () => ({ basePath, siteAdaptiveAuthLoginHref, isLoggedInVisitor, siteIndexURL }),
        [basePath, siteAdaptiveAuthLoginHref, isLoggedInVisitor, siteIndexURL]
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
 * Return whether the visitor has a visitor auth token, with or without claims.
 */
export function useIsLoggedInVisitor() {
    const context = React.useContext(SpaceLayoutContext);
    if (!context) {
        throw new Error('SpaceLayoutContext not found');
    }
    return context.isLoggedInVisitor;
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
