import type * as api from '@gitbook/api';
import type { headers as nextHeaders } from 'next/headers';
import { GITBOOK_API_PUBLIC_URL, GITBOOK_DISABLE_TRACKING } from './env';

/**
 * Return true if events should be tracked on the site.
 * Can be called from the static context or the dynamic context.
 * In the static context, only an env variable is checked.
 * In the dynamic context, the request headers are checked - this allows the middleware
 * to disable tracking for preview requests.
 */
export function shouldTrackEvents(headers?: Awaited<ReturnType<typeof nextHeaders>>): boolean {
    if (GITBOOK_DISABLE_TRACKING) {
        return false;
    }

    const disableTrackingHeader = headers?.get('x-gitbook-disable-tracking');

    if (disableTrackingHeader === 'true') {
        return false;
    }

    return true;
}

/**
 * A server-side insight event input where session/location are optional.
 * Missing fields are filled with sensible defaults.
 */
export type ServerInsightsEventInput = api.SiteInsightsEvent extends infer E
    ? E extends api.SiteInsightsEventBase
        ? Omit<E, 'session' | 'location' | 'timestamp'> & {
              session?: Partial<api.SiteInsightsEventSession>;
              location?: Partial<api.SiteInsightsEventLocation>;
              timestamp?: string;
          }
        : never
    : never;

const defaultSession: api.SiteInsightsEventSession = {
    sessionId: '',
    visitorId: '',
    userAgent: '',
    language: null,
    cookies: {},
    referrer: null,
};

const defaultLocation: api.SiteInsightsEventLocation = {
    url: '',
    siteSection: null,
    siteSpace: null,
    siteShareKey: null,
    space: null,
    revision: null,
    page: null,
};

/**
 * Post insight events to the GitBook API.
 * Can be used from server-side code (e.g. MCP route handlers) to track events directly.
 */
export async function postInsightsEvents(args: {
    organizationId: string;
    siteId: string;
    events: ServerInsightsEventInput[];
    /** Optional request to extract geolocation headers from. */
    request?: Request;
}) {
    if (GITBOOK_DISABLE_TRACKING) {
        return;
    }

    const { organizationId, siteId, events, request } = args;

    const geolocation = request ? extractGeolocation(request) : {};

    const fullEvents: api.SiteInsightsEvent[] = events.map((event) => ({
        ...event,
        session: { ...defaultSession, ...event.session },
        location: { ...defaultLocation, ...event.location },
        timestamp: event.timestamp ?? new Date().toISOString(),
    })) as api.SiteInsightsEvent[];

    const url = new URL(
        `${GITBOOK_API_PUBLIC_URL}/v1/orgs/${organizationId}/sites/${siteId}/insights/events`
    );

    return await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...geolocation,
        },
        body: JSON.stringify({ events: fullEvents }),
    });
}

/**
 * Serve as a proxy to the analytics endpoint, forwarding the request body and required parameters.
 */
export async function serveProxyAnalyticsEvent(req: Request) {
    const requestURL = new URL(req.url);

    const org = requestURL.searchParams.get('o');
    const site = requestURL.searchParams.get('s');
    if (!org || !site) {
        return new Response('Missing required query parameters: o (org) and s (site)', {
            status: 400,
            headers: { 'content-type': 'text/plain' },
        });
    }

    const body = (await req.json()) as { events: api.SiteInsightsEvent[] };
    // Here we should filter every event that is older than 5 minutes as the API will reject them anyway, we might as well do it here
    const filteredEvents = body.events.filter((event) => {
        const eventDate = event.timestamp ? new Date(event.timestamp) : Date.now();
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        return eventDate > fiveMinutesAgo;
    });

    if (filteredEvents.length === 0) {
        return new Response('No valid events to process', {
            status: 400,
            headers: { 'content-type': 'text/plain' },
        });
    }

    return await postInsightsEvents({
        organizationId: org,
        siteId: site,
        events: filteredEvents,
        request: req,
    });
}

/**
 * Extract geolocation headers from a request (Vercel/OpenNext).
 */
function extractGeolocation(req: Request): Record<string, string> {
    const country =
        req.headers.get('x-open-next-country') || req.headers.get('x-vercel-ip-country');
    const latitude =
        req.headers.get('x-open-next-latitude') || req.headers.get('x-vercel-ip-latitude');
    const longitude =
        req.headers.get('x-open-next-longitude') || req.headers.get('x-vercel-ip-longitude');
    const continent =
        req.headers.get('x-open-next-continent') || req.headers.get('x-vercel-ip-continent');

    return {
        ...(country ? { 'x-location-country': country } : {}),
        ...(latitude ? { 'x-location-latitude': latitude } : {}),
        ...(longitude ? { 'x-location-longitude': longitude } : {}),
        ...(continent ? { 'x-location-continent': continent } : {}),
    };
}
