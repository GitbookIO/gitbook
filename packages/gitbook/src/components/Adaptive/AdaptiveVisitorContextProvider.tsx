'use client';

import type { GitBookSiteContext } from '@/lib/context';
import { ExpressionRuntime, parseTemplate } from '@gitbook/expr';
import { OpenAPITryItPrefillContextProvider } from '@gitbook/react-openapi';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type VisitorClaimsData = {
    visitor: {
        claims: Record<string, unknown> & {
            unsigned: Record<string, unknown>;
        };
    };
};

const AdaptiveVisitorContext = createContext<{ visitorClaims: VisitorClaimsData } | null>(null);

/**
 * Provide context to adapt site based on visitor claims.
 */
export function AdaptiveVisitorContextProvider(
    props: React.PropsWithChildren<{
        getVisitorClaimsUrl: string;
        contextId: GitBookSiteContext['contextId'];
    }>
) {
    const { getVisitorClaimsUrl, contextId, children } = props;

    const runtime = useRef<ExpressionRuntime>(new ExpressionRuntime());
    const [visitorClaimsData, setVisitorClaimsData] = useState<VisitorClaimsData | null>(null);

    useEffect(() => {
        // Only fetch visitor claims if contextId is defined (adaptive content site).
        if (!contextId) {
            setVisitorClaimsData(null);
            return;
        }

        async function fetchVisitorData() {
            try {
                const res = await fetch(getVisitorClaimsUrl);
                if (!res.ok) {
                    setVisitorClaimsData(null);
                    return;
                }
                const data = await res.json<VisitorClaimsData>();
                setVisitorClaimsData(data);
            } catch (err) {
                console.error('Error fetching visitor claims data', err);
                setVisitorClaimsData(null);
            }
        }
        fetchVisitorData();
    }, [getVisitorClaimsUrl, contextId]);

    const resolveTryItPrefillExpression = useCallback(
        (expr: string) => {
            if (!visitorClaimsData) {
                return undefined;
            }
            const parts = parseTemplate(expr);
            if (!parts.length) {
                return undefined;
            }
            return runtime.current.evaluateTemplate(expr, visitorClaimsData);
        },
        [visitorClaimsData]
    );

    return (
        <AdaptiveVisitorContext.Provider
            value={visitorClaimsData ? { visitorClaims: visitorClaimsData } : null}
        >
            <OpenAPITryItPrefillContextProvider
                resolveTryItPrefillExpression={resolveTryItPrefillExpression}
            >
                {children}
            </OpenAPITryItPrefillContextProvider>
        </AdaptiveVisitorContext.Provider>
    );
}

export function useAdaptiveVisitorContext() {
    return useContext(AdaptiveVisitorContext);
}
