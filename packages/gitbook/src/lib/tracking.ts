import type { headers as nextHeaders } from 'next/headers';
import { GITBOOK_API_URL, GITBOOK_DISABLE_TRACKING } from './env';

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

    const org = requestURL.searchParams.get('o');
    const site = requestURL.searchParams.get('s');
    if (!org || !site) {
        return new Response('Missing required query parameters: o (org) and s (site)', {
            status: 400,
            headers: { 'content-type': 'text/plain' },
        });
    }
    const url = new URL(`${GITBOOK_API_URL}/v1/orgs/${org}/sites/${site}/insights/events`);
    return await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: req.body,
    });
}
