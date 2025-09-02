'use client';

import type { SiteInsightsDisplayContext } from '@gitbook/api';
import * as React from 'react';

import { useCurrentPage } from '../hooks';
import { useTrackEvent } from './InsightsProvider';

/**
 * Track a page view event.
 */
export function TrackPageViewEvent(props: {
    displayContext: SiteInsightsDisplayContext;
}) {
    const { displayContext } = props;
    const page = useCurrentPage();
    const trackEvent = useTrackEvent();

    React.useEffect(() => {
        trackEvent(
            {
                type: 'page_view',
            },
            {
                pageId: page?.pageId ?? null,
                displayContext,
            }
        );
    }, [page, trackEvent, displayContext]);

    return null;
}
