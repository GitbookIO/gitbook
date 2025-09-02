'use client';

import type { GitBookSiteContext } from '@/lib/context';
import { OpenAPIPrefillContextProvider } from '@gitbook/react-openapi';
import * as React from 'react';

import { createContext, useContext } from 'react';

export type AdaptiveVisitorClaimsData = {
    visitor: {
        claims: Record<string, unknown> & { unsigned: Record<string, unknown> };
    };
};

/**
 * In-memory cache of visitor claims, keyed by contextId.
 */
const adaptiveVisitorCache = new Map<
    string,
    {
        data: AdaptiveVisitorClaimsData | null;
        promise: Promise<AdaptiveVisitorClaimsData | null> | null;
    }
>();

/**
 * Factory that creates a function to fetch visitor claims
 * for a given endpoint URL and contextId so it can be exposed as adaptive visitor context.
 *
 * The returned function caches results per context ID to avoids duplicate
 * requests to fetch the claims when the context ID doesn't change.
 */
async function getAdaptiveVisitorClaimsFactory(
    url: string,
    contextId?: string
): Promise<AdaptiveVisitorClaimsData | null> {
    // Only fetch visitor claims if contextId is defined (adaptive content site).
    if (!contextId) {
        return null;
    }

    const cached = adaptiveVisitorCache.get(contextId);
    if (cached?.data) {
        return cached.data;
    }
    if (cached?.promise) {
        return cached.promise;
    }

    const promise = (async () => {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                return null;
            }
            const data = await res.json<AdaptiveVisitorClaimsData>();
            adaptiveVisitorCache.set(contextId, { data, promise: null });
            return data;
        } catch {
            return null;
        }
    })();

    adaptiveVisitorCache.set(contextId, { data: null, promise });

    return promise;
}

const AdaptiveVisitorContext = createContext<() => Promise<AdaptiveVisitorClaimsData | null>>(() =>
    Promise.resolve(null)
);

/**
 * Provide context to adapt site based on visitor claims.
 */
export function AdaptiveVisitorContextProvider(
    props: React.PropsWithChildren<{
        visitorClaimsURL: string;
        contextId: GitBookSiteContext['contextId'];
    }>
) {
    const { visitorClaimsURL, contextId, children } = props;

    const getAdaptiveVisitorClaims = React.useCallback(
        () => getAdaptiveVisitorClaimsFactory(visitorClaimsURL, contextId),
        [visitorClaimsURL, contextId]
    );

    return (
        <AdaptiveVisitorContext.Provider value={getAdaptiveVisitorClaims}>
            <OpenAPIPrefillContextProvider getPrefillInputContextData={getAdaptiveVisitorClaims}>
                {children}
            </OpenAPIPrefillContextProvider>
        </AdaptiveVisitorContext.Provider>
    );
}

export function useAdaptiveVisitor() {
    return useContext(AdaptiveVisitorContext);
}
