'use client';

import { useParams, useSelectedLayoutSegment } from 'next/navigation';

import { removeLeadingSlash } from '@/lib/paths';

/**
 * Return the page of the current page being rendered.
 */
export function useCurrentPagePath() {
    // For V2, we use the params to get the page path.
    const params = useParams<{ pagePath?: string }>();

    // For V1, we use the selected layout segment.
    const rawActiveSegment = useSelectedLayoutSegment() ?? '';

    if (typeof params.pagePath === 'string') {
        return removeLeadingSlash(decodeURIComponent(params.pagePath));
    }

    return decodeURIComponent(rawActiveSegment);
}
