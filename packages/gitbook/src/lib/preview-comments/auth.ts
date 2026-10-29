import { GITBOOK_API_OAUTH_URL } from '@/lib/env';
import { getPathScopedCookieName } from '@/lib/visitors';

/**
 * Scopes needed to read and post comments on behalf of the signed-in GitBook user.
 */
const PREVIEW_COMMENTS_SCOPES = 'space:read space:write';

/**
 * Pending authorization, stored between the login and callback routes.
 */
export interface PreviewCommentsPendingAuth {
    clientId: string;
    redirectUri: string;
    state: string;
    codeVerifier: string;
}

/**
 * Signed-in session, stored in an httpOnly cookie so scripts running on the site can't read it.
 */
export interface PreviewCommentsSession {
    clientId: string;
    accessToken: string;
    refreshToken: string | null;
    /** Epoch (ms) after which the access token should be refreshed. */
    expiresAt: number;
}

interface OAuthTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
}

/**
 * Cookies are scoped per site by name (not by path) so a single sign-in works across all
 * the change requests and sections of a site.
 */
export function getPreviewCommentsCookieNames(siteId: string) {
    return {
        session: getPathScopedCookieName('gitbook-comments-session', siteId),
        pendingAuth: getPathScopedCookieName('gitbook-comments-auth', siteId),
    };
}

export function getPreviewCommentsCookieOptions(maxAge: number) {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // Lax so the cookie is sent on the top-level redirect back from the OAuth server.
        sameSite: 'lax' as const,
        path: '/',
        maxAge,
    };
}

export function parseCookieJSON<T>(value: string | undefined): T | null {
    if (!value) {
        return null;
    }
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

/**
 * Register a public OAuth client for the site's callback URL (RFC 7591).
 * Redirect URIs must be known upfront, and each site has its own host, so we register on demand.
 */
export async function registerPreviewCommentsClient(input: {
    redirectUri: string;
    clientName: string;
}): Promise<string> {
    const response = await fetch(`${GITBOOK_API_OAUTH_URL}/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            client_name: input.clientName.slice(0, 80),
            redirect_uris: [input.redirectUri],
            response_types: ['code'],
            token_endpoint_auth_method: 'none',
            application_type: 'web',
            scope: PREVIEW_COMMENTS_SCOPES,
        }),
    });

    if (!response.ok) {
        throw new Error(`OAuth client registration failed (${response.status})`);
    }

    const json = (await response.json()) as { client_id: string };
    return json.client_id;
}

/**
 * Build the URL to the OAuth consent screen.
 */
export async function getPreviewCommentsAuthorizeURL(
    pendingAuth: PreviewCommentsPendingAuth
): Promise<string> {
    const url = new URL(`${GITBOOK_API_OAUTH_URL}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', pendingAuth.clientId);
    url.searchParams.set('redirect_uri', pendingAuth.redirectUri);
    url.searchParams.set('scope', PREVIEW_COMMENTS_SCOPES);
    url.searchParams.set('state', pendingAuth.state);
    url.searchParams.set('code_challenge', await getCodeChallenge(pendingAuth.codeVerifier));
    url.searchParams.set('code_challenge_method', 'S256');
    return url.toString();
}

/**
 * Exchange an authorization code for a session.
 */
export async function exchangePreviewCommentsCode(
    pendingAuth: PreviewCommentsPendingAuth,
    code: string
): Promise<PreviewCommentsSession> {
    return requestToken(pendingAuth.clientId, {
        grant_type: 'authorization_code',
        code,
        redirect_uri: pendingAuth.redirectUri,
        code_verifier: pendingAuth.codeVerifier,
    });
}

/**
 * Refresh an expired session, or return null when it can't be refreshed.
 */
export async function refreshPreviewCommentsSession(
    session: PreviewCommentsSession
): Promise<PreviewCommentsSession | null> {
    if (!session.refreshToken) {
        return null;
    }

    try {
        return await requestToken(session.clientId, {
            grant_type: 'refresh_token',
            refresh_token: session.refreshToken,
        });
    } catch {
        return null;
    }
}

async function requestToken(
    clientId: string,
    params: Record<string, string>
): Promise<PreviewCommentsSession> {
    const response = await fetch(`${GITBOOK_API_OAUTH_URL}/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, ...params }),
    });

    if (!response.ok) {
        throw new Error(`OAuth token request failed (${response.status})`);
    }

    const json = (await response.json()) as OAuthTokenResponse;
    return {
        clientId,
        accessToken: json.access_token,
        refreshToken: json.refresh_token ?? null,
        // Refresh a minute early to avoid racing the expiry.
        expiresAt: Date.now() + ((json.expires_in ?? 3600) - 60) * 1000,
    };
}

/**
 * Generate a URL-safe random string, used for the PKCE verifier and the state.
 */
export function createRandomString(byteLength = 32): string {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return toBase64URL(bytes);
}

async function getCodeChallenge(codeVerifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
    return toBase64URL(new Uint8Array(digest));
}

function toBase64URL(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}
