'use client';

import { createContext, useContext, useMemo } from 'react';
import { useEventCallback } from 'usehooks-ts';

interface OpenAPIOperationPointer {
    path: string;
    method: string;
}

interface OpenAPIOperationContextValue {
    onOpenClient: (pointer: OpenAPIOperationPointer) => void;
}

const OpenAPIOperationContext = createContext<OpenAPIOperationContextValue>({
    onOpenClient: () => {},
});

/**
 * Provider for the OpenAPIOperationContext.
 */
export function OpenAPIOperationContextProvider(
    props: React.PropsWithChildren<Partial<OpenAPIOperationContextValue>>
) {
    const { children } = props;

    const onOpenClient = useEventCallback((pointer: OpenAPIOperationPointer) => {
        props.onOpenClient?.(pointer);
    });

    const value = useMemo(() => ({ onOpenClient }), [onOpenClient]);

    return (
        <OpenAPIOperationContext.Provider value={value}>
            {children}
        </OpenAPIOperationContext.Provider>
    );
}

/**
 * Hook to access the OpenAPIOperationContext.
 */
export function useOpenAPIOperationContext() {
    return useContext(OpenAPIOperationContext);
}
