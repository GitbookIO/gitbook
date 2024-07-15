'use client';

import type { RequestSiteTrackPageView, RequestSpaceTrackPageView } from '@gitbook/api';
import cookies from 'js-cookie';
import * as React from 'react';

import { getVisitorId } from '@/lib/analytics';
import { SiteContentPointer } from '@/lib/api';

/**
 * Track the page view for the current page to integrations.
 */
export function TrackPageView(props: {
    apiHost: string;
    sitePointer?: Pick<SiteContentPointer, 'siteId' | 'organizationId'>;
    spaceId: string;
    pageId: string | undefined;
}) {
    const { apiHost, sitePointer, spaceId, pageId } = props;

    React.useEffect(() => {
        trackPageView({ apiHost, sitePointer, spaceId, pageId });
    }, [apiHost, spaceId, pageId, sitePointer]);

    return null;
}

async function sendSpaceTrackPageViewRequest(args: {
    apiHost: string;
    spaceId: string;
    body: RequestSpaceTrackPageView;
}) {
    const { apiHost, spaceId, body } = args;
    const url = new URL(apiHost);
    url.pathname = `/v1/spaces/${spaceId}/insights/track_view`;

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
}

async function sendSiteTrackPageViewRequest(args: {
    apiHost: string;
    sitePointer: Pick<SiteContentPointer, 'siteId' | 'organizationId'>;
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
 * Check if the current page is in an iframe.
 * This is used to avoid tracking page views in iframes.
 */
function isInIframe(): boolean {
    try {
        return window.self !== window.top || window.frameElement !== null;
    } catch (e) {
        return true;
    }
}
/**
 * Track the page view for the current page to GitBook.
 * We don't use the API client to avoid shipping 80kb of JS to the client.
 * And instead use a simple fetch.
 */
async function trackPageView(args: {
    apiHost: string;
    sitePointer?: Pick<SiteContentPointer, 'siteId' | 'organizationId'>;
    spaceId: string;
    pageId: string | undefined;
}) {
    const { apiHost, sitePointer, pageId, spaceId } = args;

    if (isInIframe()) {
        return;
    }

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
        sitePointer
            ? await sendSiteTrackPageViewRequest({
                  apiHost,
                  sitePointer,
                  body: {
                      ...sharedTrackedProps,
                      spaceId,
                  },
              })
            : await sendSpaceTrackPageViewRequest({ apiHost, spaceId, body: sharedTrackedProps });
    } catch (error) {
        console.error('Failed to track page view', error);
    }
}
