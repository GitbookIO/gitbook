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
 * Serve as a proxy to the analytics endpoint, forwarding the request body and required parameters.
 */
export async function serveProxyAnalyticsEvent(req: Request) {
    const requestURL = new URL(req.url);

    // Fill geolocation data from request headers either from OpenNext or Vercel
    const country = req.headers.get('x-open-next-country') || req.headers.get('x-vercel-ip-country');
    const latitude = req.headers.get('x-open-next-latitude') || req.headers.get('x-vercel-ip-latitude');
    const longitude = req.headers.get('x-open-next-longitude') || req.headers.get('x-vercel-ip-longitude');
    // OpenNext doesn't provide continent info, we add it manually in our custom worker
    const continent = req.headers.get('x-open-next-continent') || req.headers.get('x-vercel-ip-continent');

    const org = requestURL.searchParams.get('o');
    const site = requestURL.searchParams.get('s');
    if (!org || !site) {
        return new Response('Missing required query parameters: o (org) and s (site)', {
            status: 400,
            headers: { 'content-type': 'text/plain' },
        });
    }

    // We make the request to the public API URL to ensure the request is properly enriched by the router..
    const url = new URL(`${GITBOOK_API_PUBLIC_URL}/v1/orgs/${org}/sites/${site}/insights/events`);
    const result = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-location-country': country || '',
            'x-location-latitude': latitude || '',
            'x-location-longitude': longitude || '',
            'x-location-continent': continent || '',
        },
        body: req.body,
    });
    //TODO: remove this, just for debugging
    const resultHeaders = new Headers(result.headers);
    resultHeaders.set('x-location-country', country || '');
    resultHeaders.set('x-location-latitude', latitude || '');
    resultHeaders.set('x-location-longitude', longitude || '');
    resultHeaders.set('x-location-continent', continent || '');
    return new Response(result.body, {
        status: result.status,
        headers: resultHeaders,
    });
}
