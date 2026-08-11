'use client';

import React from 'react';

import { useOptionalCurrentContent } from './useCurrentContent';
import { useCurrentPagePath } from './useCurrentPagePath';
import { useIsMounted } from './useIsMounted';

const ClientNavigationSelectionContext = React.createContext(false);

/**
 * Mark a subtree whose server-rendered selection cannot be trusted.
 * Under PPR the header and the table of contents are cached fragments shared across pages, so the
 * "where am I" state they were rendered with belongs to another page and has to be recomputed here.
 */
export function ClientNavigationSelectionProvider(
    props: React.PropsWithChildren<{ enabled: boolean }>
) {
    const { enabled, children } = props;

    return (
        <ClientNavigationSelectionContext.Provider value={enabled}>
            {children}
        </ClientNavigationSelectionContext.Provider>
    );
}

/**
 * Return the page path to mark as selected, or null while it hasn't been resolved on the client.
 */
export function useSelectedPagePath(): string | null {
    // The page path always comes from the route, it just can't be trusted before hydration.
    const pagePath = useCurrentPagePath();
    return useSelected(pagePath, pagePath);
}

/**
 * Return the site section to mark as selected, or null while it hasn't been resolved on the client.
 */
export function useSelectedSiteSectionId(serverValue: string | null): string | null {
    return useSelected(serverValue, useOptionalCurrentContent()?.siteSectionId ?? null);
}

/**
 * Return the site space to mark as selected, or null while it hasn't been resolved on the client.
 */
export function useSelectedSiteSpaceId(serverValue: string | null): string | null {
    return useSelected(serverValue, useOptionalCurrentContent()?.siteSpaceId ?? null);
}

/**
 * Pick between the value the server rendered with and the one resolved on the client.
 * Nothing is selected until mount, so a stale highlight is never painted and the first client
 * render still matches the cached markup (which was produced by this same branch).
 */
function useSelected<T>(serverValue: T, clientValue: T): T | null {
    const enabled = React.useContext(ClientNavigationSelectionContext);
    const isMounted = useIsMounted();

    if (!enabled) {
        return serverValue;
    }

    return isMounted ? clientValue : null;
}
