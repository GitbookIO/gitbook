'use client';

import * as React from 'react';

import { useCurrentPage } from '../hooks';
import { useTrackEvent } from './InsightsProvider';

/**
 * Track a page view event.
 */
export function TrackPageViewEvent() {
    const page = useCurrentPage();
    const trackEvent = useTrackEvent();

    React.useEffect(() => {
        trackEvent(
            {
                type: 'page_view',
            },
            {
                pageId: page?.pageId ?? null,
            }
        );
    }, [page, trackEvent]);

    return null;
}
