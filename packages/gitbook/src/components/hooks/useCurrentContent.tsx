'use client';

import type { VisitorAuthClaims } from '@/lib/adaptive';
import * as React from 'react';

/**
 * Global context for the current content.
 */
export type CurrentContentContext = {
    organizationId: string;
    siteId: string;
    siteSectionId: string | null;
    siteSpaceId: string | null;
    siteShareKey: string | null;
    spaceId: string;
    revisionId: string;
    visitorAuthClaims: VisitorAuthClaims;
};

const ReactCurrentContentContext = React.createContext<CurrentContentContext | null>(null);

/**
 * Hook to get the current content.
 */
export function useCurrentContent(): CurrentContentContext {
    const context = React.useContext(ReactCurrentContentContext);
    if (!context) {
        throw new Error('useCurrentContent must be used within a CurrentContentProvider');
    }

    return context;
}

/**
 * Provider for the current content.
 */
export function CurrentContentProvider(props: React.PropsWithChildren<CurrentContentContext>) {
    const contextValue = React.useMemo(() => {
        return {
            organizationId: props.organizationId,
            siteId: props.siteId,
            siteSectionId: props.siteSectionId,
            siteSpaceId: props.siteSpaceId,
            siteShareKey: props.siteShareKey,
            spaceId: props.spaceId,
            revisionId: props.revisionId,
            visitorAuthClaims: props.visitorAuthClaims,
        };
    }, [
        props.organizationId,
        props.siteId,
        props.siteSectionId,
        props.siteSpaceId,
        props.siteShareKey,
        props.spaceId,
        props.revisionId,
        props.visitorAuthClaims,
    ]);

    return (
        <ReactCurrentContentContext.Provider value={contextValue}>
            {props.children}
        </ReactCurrentContentContext.Provider>
    );
}
