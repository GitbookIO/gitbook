'use client';

import type { RequestSpaceTrackPageView } from '@gitbook/api';
import cookies from 'js-cookie';
import * as React from 'react';

import { getVisitorId } from '@/lib/analytics';

/**
 * Track the page view for the current page to integrations.
 */
export function TrackPageView(props: {
    apiHost: string;
    spaceId: string;
    pageId: string | undefined;
}) {
    const { apiHost, spaceId, pageId } = props;

    React.useEffect(() => {
        trackPageView(apiHost, spaceId, pageId);
    }, [apiHost, spaceId, pageId]);

    return null;
}

let latestPageId: string | undefined | null = null;

/**
 * Track the page view for the current page to GitBook.
 * We don't use the API client to avoid shipping 80kb of JS to the client.
 * And instead use a simple fetch.
 */
async function trackPageView(apiHost: string, spaceId: string, pageId: string | undefined) {
    if (pageId === latestPageId) {
        // The hook can be called multiple times, we only want to track once.
        return;
    }

    latestPageId = pageId;

    const visitorId = await getVisitorId();
    const body: RequestSpaceTrackPageView = {
        url: window.location.href,
        pageId,
        visitor: {
            anonymousId: visitorId,
            userAgent: window.navigator.userAgent,
            language: window.navigator.language,
            cookies: cookies.get(),
        },
        referrer: document.referrer,
    };

    const url = new URL(apiHost);
    url.pathname = `/v1/spaces/${spaceId}/insights/track_view`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error('Failed to track page view', error);
    }
}
