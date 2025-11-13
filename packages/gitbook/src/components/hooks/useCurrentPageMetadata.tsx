'use client';
import React from 'react';
import type { PageMetaLinks } from '../SitePage';

const CurrentPageMetadataContext = React.createContext<{
    metaLinks: PageMetaLinks | null;
    setMetaLinks: (links: PageMetaLinks | null) => void;
}>({
    metaLinks: null,
    setMetaLinks: () => {},
});

/**
 * Provide the client context about the currently viewed page metadata.
 */
export function CurrentPageMetadataProvider(props: {
    children: React.ReactNode;
}) {
    const [metaLinks, setMetaLinks] = React.useState<PageMetaLinks | null>(null);

    const value = React.useMemo(() => ({ metaLinks, setMetaLinks }), [metaLinks]);

    return (
        <CurrentPageMetadataContext.Provider value={value}>
            {props.children}
        </CurrentPageMetadataContext.Provider>
    );
}

/**
 * Return the metadata for the current page.
 */
export function useCurrentPageMetadata() {
    const context = React.useContext(CurrentPageMetadataContext);
    if (!context) {
        throw new Error('useCurrentPageMetadata must be used within a CurrentPageMetadataProvider');
    }
    return context;
}
