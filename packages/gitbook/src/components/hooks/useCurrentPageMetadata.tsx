'use client';
import type { PageMetaLinks } from '../SitePage';

import * as zustand from 'zustand';

/**
 * A store for the current page metadata.
 *
 * We use a global store because the metadata is generated and set by the Page component
 * but needs to be accessed by other components (ex - Layout) that are not its descendants.
 */
export const currentPageMetadataStore = zustand.create<{
    metaLinks: PageMetaLinks | null;
    currentPage: {
        id: string;
        spaceId: string;
    } | null;
}>(() => ({
    metaLinks: null,
    currentPage: null,
}));

/**
 * Return the metadata for the current page.
 */
export function useCurrentPageMetadata() {
    return zustand.useStore(currentPageMetadataStore, (state) => state);
}
