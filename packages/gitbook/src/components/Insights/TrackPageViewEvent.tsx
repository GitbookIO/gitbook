'use client';

import * as React from 'react';

import type { SiteInsightsDisplayContext } from '@gitbook/api';

import { useCurrentPage } from '../hooks';
import { useIsVisible } from '../VisibilityContext';
import { useTrackEvent } from './InsightsProvider';

/**
 * Track a page view event.
 */
export function TrackPageViewEvent(props: { displayContext: SiteInsightsDisplayContext }) {
    const { displayContext } = props;
    const page = useCurrentPage();
    const trackEvent = useTrackEvent();
    // Always true outside of the embed, whose frame can be loaded while hidden.
    const isVisible = useIsVisible();

    React.useEffect(() => {
        if (!isVisible) {
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
    }, [page, trackEvent, displayContext, isVisible]);

    return null;
}
