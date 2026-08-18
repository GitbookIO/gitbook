'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

import { removeLeadingSlash } from '@/lib/paths';

/**
 * Return the page of the current page being rendered.
 */
export function useCurrentPagePath() {
    const params = useParams<{ pagePath?: string }>();

    return useMemo(() => {
        if (params?.pagePath && typeof params.pagePath === 'string') {
            return removeLeadingSlash(decodeURIComponent(params.pagePath));
        }

        return '';
    }, [params?.pagePath]);
}
