'use client';

import * as React from 'react';
import { useTrackEvent } from "./InsightsProvider";

/**
 * Track a page view event.
 */
export function TrackPageViewEvent(props: {
    pageId: string | null;
}) {
    const { pageId } = props;
    const trackEvent = useTrackEvent();

    React.useEffect(() => {
        trackEvent({
            type: 'page_view',
            pageId,
        });
    }, [pageId, trackEvent]);

    return null;
}
