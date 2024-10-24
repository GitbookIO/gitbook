'use client';

import type { RequestSiteTrackPageView } from '@gitbook/api';
import cookies from 'js-cookie';
import * as React from 'react';

import { getVisitorId } from '@/lib/analytics';
import { SiteContentPointer } from '@/lib/api';

/**
 * Track the page view for the current page to integrations.
 */
export function TrackPageView(props: {
    apiHost: string;
    sitePointer: SiteContentPointer;
    pageId: string | undefined;
}) {
    const { apiHost, sitePointer, pageId } = props;

    React.useEffect(() => {
        trackPageView({ apiHost, sitePointer, pageId });
    }, [apiHost, pageId, sitePointer]);

    return null;
}

async function sendSiteTrackPageViewRequest(args: {
    apiHost: string;
    sitePointer: SiteContentPointer;
    body: RequestSiteTrackPageView;
}) {
    const { apiHost, sitePointer, body } = args;
    const url = new URL(apiHost);
    url.pathname = `/v1/orgs/${sitePointer.organizationId}/sites/${sitePointer.siteId}/insights/track_view`;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
}

let latestPageId: string | undefined | null = null;

/**
 * Track the page view for the current page to GitBook.
 * We don't use the API client to avoid shipping 80kb of JS to the client.
 * And instead use a simple fetch.
 */
async function trackPageView(args: {
    apiHost: string;
    sitePointer: SiteContentPointer;
    pageId: string | undefined;
}) {
    const { apiHost, sitePointer, pageId } = args;
    if (pageId === latestPageId) {
        // The hook can be called multiple times, we only want to track once.
        return;
    }

    latestPageId = pageId;

    const visitorId = await getVisitorId();
    const sharedTrackedProps = {
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

    try {
        await sendSiteTrackPageViewRequest({
            apiHost,
            sitePointer,
            body: {
                ...sharedTrackedProps,
                siteSpaceId: sitePointer.siteSpaceId,
            },
        });
    } catch (error) {
        console.error('Failed to track page view', error);
    }
}
