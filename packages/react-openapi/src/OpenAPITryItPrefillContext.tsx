'use client';

import { createContext, useContext, useMemo } from 'react';
import type { TryItPrefillExpressionResolver } from './util/tryit-prefill';

interface OpenAPITryItPrefillContextValue {
    resolveTryItPrefillExpression: TryItPrefillExpressionResolver;
}

const OpenAPITryItPrefillContext = createContext<OpenAPITryItPrefillContextValue>({
    resolveTryItPrefillExpression: () => {
        return undefined;
    },
});

/**
 * Provide context to help prefill request attributes for the Try It feature using visitor info.
 */
export function OpenAPITryItPrefillContextProvider(
    props: React.PropsWithChildren<OpenAPITryItPrefillContextValue>
) {
    const { resolveTryItPrefillExpression, children } = props;

    const value = useMemo(
        () => ({ resolveTryItPrefillExpression }),
        [resolveTryItPrefillExpression]
    );

    return (
        <OpenAPITryItPrefillContext.Provider value={value}>
            {children}
        </OpenAPITryItPrefillContext.Provider>
    );
}

/**
 * Hook to access the OpenAPIOperationContext.
 */
export function useOpenAPITryItPrefillContext() {
    return useContext(OpenAPITryItPrefillContext);
}
