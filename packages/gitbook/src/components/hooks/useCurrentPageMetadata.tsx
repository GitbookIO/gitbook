'use client';
import type { PageMetaLinks } from '../SitePage';

import * as zustand from 'zustand';

/**
 * A store for the current page metadata.
 */
export const currentPageMetadataStore = zustand.create<{
    metaLinks: PageMetaLinks | null;
}>(() => ({
    metaLinks: null,
}));

/**
 * Return the metadata for the current page.
 */
export function useCurrentPageMetadata() {
    const metaLinks = zustand.useStore(currentPageMetadataStore, (state) => state.metaLinks);
    return {
        metaLinks,
    };
}
