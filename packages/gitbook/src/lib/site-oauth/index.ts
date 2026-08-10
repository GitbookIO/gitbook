import 'server-only';

import { createHmac } from 'node:crypto';

import { GITBOOK_OAUTH_SERVER_URL, GITBOOK_SITE_OAUTH_SIGNING_SECRET } from '@/lib/env';

/**
 * Details about the OAuth client requesting authorization, as returned by the OAuth server. The
 * `name` and `uri` are client-supplied and must be treated as untrusted when rendered.
 */
export type SiteOAuthConsentClient = {
    name: string;
    uri?: string;
    logoUri?: string;
    verified: boolean;
    verifiedName?: string;
};

/**
 * Result of a successful `consent/start` call: everything GBO needs to render the consent screen.
 */
export type SiteOAuthConsentStart = {
    consentSessionId: string;
    client: SiteOAuthConsentClient;
    scopes: string[];
    redirectUri: string;
};

/**
 * A visitor's decision on a consent request.
 */
export type SiteOAuthConsentDecision = 'approve' | 'deny';

/**
 * Error thrown when a server-to-server call to the OAuth server consent endpoint fails. It carries
 * the upstream HTTP status so callers can distinguish an expired/consumed session (400) from an
 * authentication problem (401).
 */
export class SiteOAuthConsentError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'SiteOAuthConsentError';
        this.status = status;
    }
}

/**
 * Start a consent session with the OAuth server for a post-login authorize resume.
 *
 * This is single-use: it consumes the pending interaction session on the OAuth server, so it must be
 * called exactly once per consent render.
 */
export async function startSiteOAuthConsent(args: {
    siteId: string;
    interactionId: string;
    jwtToken: string;
}): Promise<SiteOAuthConsentStart> {
    const { siteId, interactionId, jwtToken } = args;
    return postToConsentEndpoint<SiteOAuthConsentStart>(siteId, 'consent/start', {
        interactionId,
        jwtToken,
    });
}

/**
 * Submit the visitor's decision to the OAuth server and get back the absolute URL to send the
 * visitor's browser to (the client's redirect URI with an auth code on approve, or an access_denied
 * redirect on deny).
 */
export async function submitSiteOAuthConsentDecision(args: {
    siteId: string;
    consentSessionId: string;
    decision: SiteOAuthConsentDecision;
    trusted: boolean;
}): Promise<{ redirectURL: string }> {
    const { siteId, consentSessionId, decision, trusted } = args;
    return postToConsentEndpoint<{ redirectURL: string }>(siteId, 'consent/decision', {
        consentSessionId,
        decision,
        // Only forward the trust acknowledgement when the visitor actually gave it; the server
        // re-checks and rejects an unverified client approved without it.
        ...(trusted ? { trusted: true } : {}),
    });
}

/**
 * Sign and POST a JSON body to a site OAuth server consent endpoint, returning the parsed response.
 *
 * The shared-secret signature matches the OAuth server's schem and is sent as the
 * `x-gitbook-signature` / `x-gitbook-timestamp` headers.
 */
async function postToConsentEndpoint<T>(
    siteId: string,
    endpoint: 'consent/start' | 'consent/decision',
    body: unknown
): Promise<T> {
    if (!GITBOOK_SITE_OAUTH_SIGNING_SECRET) {
        throw new SiteOAuthConsentError('Missing sites OAuth signing secret', 500);
    }

    const rawBody = JSON.stringify(body);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac('sha256', GITBOOK_SITE_OAUTH_SIGNING_SECRET)
        .update(`${siteId}:${timestamp}:${rawBody}`)
        .digest('hex');

    const url = new URL(GITBOOK_OAUTH_SERVER_URL);
    url.pathname += `/${encodeURIComponent(siteId)}/${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-gitbook-signature': signature,
            'x-gitbook-timestamp': String(timestamp),
        },
        body: rawBody,
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new SiteOAuthConsentError(
            `OAuth server ${endpoint} responded with ${response.status}`,
            response.status
        );
    }

    return (await response.json()) as T;
}
