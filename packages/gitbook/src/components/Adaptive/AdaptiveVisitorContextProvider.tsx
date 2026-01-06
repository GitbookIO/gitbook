'use client';

import type { GitBookSiteContext } from '@/lib/context';
import { OpenAPIPrefillContextProvider } from '@gitbook/react-openapi';
import * as React from 'react';
import { createContext, useContext } from 'react';
import type { AdaptiveVisitorClaims } from './types';

/**
 * In-memory cache of visitor claim readers keyed by contextId.
 */
const adaptiveVisitorReaderCache = new Map<
    string,
    ReturnType<typeof createResourceReader<AdaptiveVisitorClaims | null>>
>();

function createResourceReader<T>(promise: Promise<T>) {
    let result: T | null | undefined;

    const suspender = (async () => {
        try {
            result = await promise;
        } catch {
            result = null;
        }
    })();

    return {
        read() {
            if (result === undefined) {
                throw suspender;
            }
            return result;
        },
    };
}

/**
 * Return an adaptive visitor claims cached reader for a given endpoint URL and contextId.
 */
function getAdaptiveVisitorClaimsReader(url: string, contextId: string) {
    let reader = adaptiveVisitorReaderCache.get(contextId);
    if (!reader) {
        const promise = (async () => {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    return null;
                }
                return await res.json<AdaptiveVisitorClaims>();
            } catch {
                return null;
            }
        })();

        reader = createResourceReader(promise);
        adaptiveVisitorReaderCache.set(contextId, reader);
    }
    return reader;
}

export type AdaptiveVisitorContextValue = () => AdaptiveVisitorClaims | null;

const AdaptiveVisitorContext = createContext<AdaptiveVisitorContextValue>(() => null);

/**
 * Provide context to adapt site based on visitor claims.
 */
export function AdaptiveVisitorContextProvider(
    props: React.PropsWithChildren<{
        visitorClaimsURL: string;
        contextId: GitBookSiteContext['contextId'] | undefined;
    }>
) {
    const { visitorClaimsURL, contextId, children } = props;

    const getAdaptiveVisitorClaims = React.useCallback(() => {
        if (!contextId) {
            return null;
        }
        return getAdaptiveVisitorClaimsReader(visitorClaimsURL, contextId).read();
    }, [visitorClaimsURL, contextId]);

    return (
        <AdaptiveVisitorContext.Provider value={getAdaptiveVisitorClaims}>
            <OpenAPIPrefillContextProvider getPrefillInputContextData={getAdaptiveVisitorClaims}>
                {children}
            </OpenAPIPrefillContextProvider>
        </AdaptiveVisitorContext.Provider>
    );
}

/**
 * Hook that returns a suspensable getter for adaptive visitor claims data.
 */
export function useAdaptiveVisitor(): AdaptiveVisitorContextValue {
    return useContext(AdaptiveVisitorContext);
}
