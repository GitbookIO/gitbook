'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import type { SiteInsightsDisplayContext } from '@gitbook/api';

import { useCurrentPage } from '../hooks';
import { useIsVisible } from '../VisibilityContext';
import { useTrackEvent } from './InsightsProvider';
import { isGitBookInternalPath } from '@/lib/paths';

/**
 * Track a page view event.
 */
export function TrackPageViewEvent(props: { displayContext: SiteInsightsDisplayContext }) {
    const { displayContext } = props;
    const page = useCurrentPage();
    const trackEvent = useTrackEvent();
    const pathname = usePathname();
    // Internal routes that 404 (e.g. `~gitbook/pdf` under an unpublished variant) aren't broken URLs.
    const isInternalNotFound = !page && isGitBookInternalPath(pathname ?? '');
    // Always true outside of the embed, whose frame can be loaded while hidden.
    const isVisible = useIsVisible();

    React.useEffect(() => {
        if (!isVisible || isInternalNotFound) {
            return;
        }

        trackEvent(
            {
                type: 'page_view',
            },
            {
                pageId: page?.pageId ?? null,
                displayContext,
            }
        );
    }, [page, trackEvent, displayContext, isVisible, isInternalNotFound]);

    return null;
}
