'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { currentPageMetadataStore, useScrollPage } from '@/components/hooks';
import type { PageMetaLinks } from './SitePage';

/**
 * Client component to initialize interactivity for a page.
 */
export function PageClientLayout({
    pageMetaLinks,
    currentPage
}: {
    pageMetaLinks: PageMetaLinks | null;
    currentPage: {
        id: string;
        spaceId: string;
    } | null;
}) {
    // We use this hook in the page layout to ensure the elements for the blocks
    // are rendered before we scroll to a hash or to the top of the page
    useScrollPage();

    // The page metadata such as meta links are generated on the server side,
    // but need to be registered on the client side in other parts of the layout
    // such as the SpaceDropdown.
    useRegisterPageMetadata({ pageMetaLinks, currentPage });

    useStripFallbackQueryParam();
    return null;
}

/**
 * Strip the fallback query parameter from current URL.
 *
 * When the user switches variants using the space dropdown, we pass a fallback=true parameter.
 * This parameter indicates that we should redirect to the root page if the path from the
 * previous variant doesn't exist in the new variant. If the path does exist, no redirect occurs,
 * so we need to remove the fallback parameter.
 */
function useStripFallbackQueryParam() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    React.useEffect(() => {
        if (searchParams?.has('fallback')) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('fallback');
            params.delete('fallbackPageID');
            params.delete('fallbackSpaceID');
            router.push(`${pathname}?${params.toString()}${window.location.hash ?? ''}`);
        }
    }, [router, pathname, searchParams]);
}

/**
 * Register the generated page metadata such as meta links for the current page.
 */
function useRegisterPageMetadata(metadata: {
    pageMetaLinks: PageMetaLinks | null;
    currentPage: {
        id: string;
        spaceId: string;
    } | null;
}) {
    const { pageMetaLinks, currentPage } = metadata;
    React.useEffect(() => {
        currentPageMetadataStore.setState({ metaLinks: pageMetaLinks, currentPage });
    }, [pageMetaLinks, currentPage]);
}
