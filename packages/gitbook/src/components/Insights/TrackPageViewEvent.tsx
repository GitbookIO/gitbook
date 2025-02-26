'use client';

import * as React from 'react';

import { type InsightsEventPageContext, useTrackEvent } from './InsightsProvider';

/**
 * Track a page view event.
 */
export function TrackPageViewEvent(props: InsightsEventPageContext) {
    const { pageId } = props;
    const trackEvent = useTrackEvent();

    React.useEffect(() => {
        trackEvent(
            {
                type: 'page_view',
            },
            {
                pageId,
            }
        );
    }, [pageId, trackEvent]);

    return null;
}
