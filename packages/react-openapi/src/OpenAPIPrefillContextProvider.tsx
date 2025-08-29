'use client';

import * as React from 'react';

export type PrefillInputContextData = Record<string, unknown>;

type PrefillContextValue = () => Promise<PrefillInputContextData | null>;

const OpenAPITryItPrefillContext = React.createContext<PrefillContextValue | null>(null);

export function OpenAPIPrefillContextProvider(
    props: React.PropsWithChildren<{
        getPrefillInputContextData: () => Promise<PrefillInputContextData | null>;
    }>
) {
    const { getPrefillInputContextData, children } = props;
    return (
        <OpenAPITryItPrefillContext.Provider value={getPrefillInputContextData}>
            {children}
        </OpenAPITryItPrefillContext.Provider>
    );
}

export function useOpenAPIPrefillContext(): PrefillContextValue {
    return React.useContext(OpenAPITryItPrefillContext) ?? (() => Promise.resolve(null));
}
