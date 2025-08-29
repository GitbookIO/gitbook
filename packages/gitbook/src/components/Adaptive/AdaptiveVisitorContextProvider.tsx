'use client';

import type { GitBookSiteContext } from '@/lib/context';
import { OpenAPIPrefillContextProvider } from '@gitbook/react-openapi';
import * as React from 'react';

import { createContext, useContext } from 'react';
import { type AdaptiveVisitorClaimsData, useAdaptiveVisitorStore } from './visitor-store';

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
    const { getAdaptiveVisitorClaimsFactory } = useAdaptiveVisitorStore();

    const getAdaptiveVisitorClaims = React.useCallback(
        () => getAdaptiveVisitorClaimsFactory(visitorClaimsURL, contextId),
        [getAdaptiveVisitorClaimsFactory, visitorClaimsURL, contextId]
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
