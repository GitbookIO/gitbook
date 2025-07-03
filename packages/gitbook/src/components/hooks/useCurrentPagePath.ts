'use client';

import { useParams } from 'next/navigation';

import { removeLeadingSlash } from '@/lib/paths';
import { useMemo } from 'react';

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
