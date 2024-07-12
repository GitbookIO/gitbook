'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { useScrollToHash } from '@/components/hooks';

function useStripFallbackQueryParam() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const stripFallbackParam = React.useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('fallback');
        router.push(`${pathname}?${params.toString()}${window.location.hash ?? ''}`);
    }, [router, pathname, searchParams]);

    React.useEffect(() => {
        stripFallbackParam();
    }, []);
}

/**
 * Client component to initialize interactivity for a page.
 */
export function PageClientLayout(props: {}) {
    // We use this hook in the page layout to ensure the elements for the blocks
    // are rendered before we scroll to the hash.
    useScrollToHash();

    useStripFallbackQueryParam();
    return null;
}
