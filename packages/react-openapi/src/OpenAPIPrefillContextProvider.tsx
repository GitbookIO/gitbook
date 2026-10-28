'use client';

import * as React from 'react';

/**
 * Prefill data that can be used to dynamically inject info into OpenAPI operation blocks.
 *
 * This is typically dynamic input context, such as visitor data or environment info.
 */
export type PrefillInputContextData = Record<string, unknown>;

/**
 * Context value is function that returns prefill data.
 */
type PrefillContextValue = () => PrefillInputContextData | null;

const OpenAPIPrefillContext = React.createContext<PrefillContextValue | null>(null);

/**
 * Provide context to help prefill dynamic info like visitor data in OpenAPI blocks.
 */
export function OpenAPIPrefillContextProvider(
    props: React.PropsWithChildren<{
        getPrefillInputContextData: () => PrefillInputContextData | null;
    }>
) {
    const { getPrefillInputContextData, children } = props;
    return (
        <OpenAPIPrefillContext.Provider value={getPrefillInputContextData}>
            {children}
        </OpenAPIPrefillContext.Provider>
    );
}

/**
 * Hook to access the prefill context function.
 */
export function useOpenAPIPrefillContext(): PrefillContextValue {
    return React.useContext(OpenAPIPrefillContext) ?? (() => null);
}
