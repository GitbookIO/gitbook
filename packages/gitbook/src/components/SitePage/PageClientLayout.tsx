'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { useCurrentPageMetadata, useScrollPage } from '@/components/hooks';
import type { PageMetaLinks } from './SitePage';

/**
 * Client component to initialize interactivity for a page.
 */
export function PageClientLayout({
    pageMetaLinks,
}: {
    pageMetaLinks: PageMetaLinks | null;
}) {
    const { setMetaLinks } = useCurrentPageMetadata();

    // We use this hook in the page layout to ensure the elements for the blocks
    // are rendered before we scroll to a hash or to the top of the page
    useScrollPage();

    React.useEffect(() => {
        setMetaLinks(pageMetaLinks);
    }, [pageMetaLinks, setMetaLinks]);

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
            router.push(`${pathname}?${params.toString()}${window.location.hash ?? ''}`);
        }
    }, [router, pathname, searchParams]);
}
