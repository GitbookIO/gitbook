import type * as api from '@gitbook/api';
import type { headers as nextHeaders } from 'next/headers';
import { apiClient } from './data/api';
import { GITBOOK_DISABLE_TRACKING } from './env';

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
 * Extract a full session object from a request.
 * Generates new sessionId/visitorId and extracts headers.
 */
function extractSessionFromRequest(request: Request): api.SiteInsightsEventSession {
    return {
        sessionId: crypto.randomUUID(),
        visitorId: crypto.randomUUID(),
        userAgent: request.headers.get('user-agent') ?? '',
        language: request.headers.get('accept-language')?.split(',')[0] ?? null,
        cookies: {},
        referrer: request.headers.get('referer') ?? null,
    };
}

/**
 * Track insight events server-side via the GitBook API.
 * Session info (userAgent, IDs) and location URL are automatically extracted from the request.
 * Event-level overrides take precedence.
 */
export async function trackServerInsightsEvents(args: {
    organizationId: string;
    siteId: string;
    events: ServerInsightsEventInput[];
    request: Request;
}) {
    if (GITBOOK_DISABLE_TRACKING) {
        return;
    }

    const { organizationId, siteId, events, request } = args;

    const api = apiClient();
    const geolocation = extractGeolocation(request);
    const requestSession = extractSessionFromRequest(request);

    const fullEvents: api.SiteInsightsEvent[] = events.map((event) => ({
        ...event,
        session: { ...requestSession, ...event.session },
        location: { ...defaultLocation, url: request.url, ...event.location },
        timestamp: event.timestamp ?? new Date().toISOString(),
    })) as api.SiteInsightsEvent[];

    return await api.orgs.trackEventsInSiteById(
        organizationId,
        siteId,
        { events: fullEvents },
        { headers: geolocation }
    );
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

    return await trackServerInsightsEvents({
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
