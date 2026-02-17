import type { Site } from '@gitbook/api';
import { type NextRequest, NextResponse } from 'next/server';
import { GITBOOK_SITES_OAUTH_SERVER_URL, GITBOOK_URL } from './env';

type OAuthProtectedResource = {
    /** Endpoint of the protected resource */
    endpoint: string;
    /** Authentication realm for this resource */
    realm?: string;
};

/**
 * Base path for OAuth 2.0 Protected Resource Metadata (RFC 9728).
 */
const OAUTH_PROTECTED_RESOURCE_METADATA_PATH = '/.well-known/oauth-protected-resource';

/**
 * List of OAuth protected resources.
 */
const OAUTH_PROTECTED_RESOURCES: OAuthProtectedResource[] = [
    { endpoint: '/~gitbook/mcp', realm: 'mcp' },
];

/**
 * Handle an authenticated request for an OAuth protected resource.
 */
export function handleUnauthedOAuthProtectedResourceRequest(args: {
    siteRequestURL: URL;
    siteId: Site['id'];
    urlMode: 'url' | 'url-host';
}) {
    const { siteRequestURL, urlMode, siteId } = args;

    // When the request is for the protected resource metadata return the info relative to the site.
    if (isOAuthProtectedResourceMetadataRequest(siteRequestURL)) {
        const resourceUrl =
            urlMode === 'url-host'
                ? siteRequestURL
                : new URL(`/url/${siteRequestURL.host}${siteRequestURL.pathname}`, GITBOOK_URL);

        const protectedResourceMetadata = {
            resource: resourceUrl.toString().replace(OAUTH_PROTECTED_RESOURCE_METADATA_PATH, ''),
            authorization_servers: [`${GITBOOK_SITES_OAUTH_SERVER_URL}/${siteId}`],
        };
        return NextResponse.json(protectedResourceMetadata);
    }

    // Otherwise return a 401 WWW-Authenticate pointing to the PRM doc to tell client where to auth.
    return createOAuthProtectedResourceUnauthResponse({
        siteRequestURL,
        urlMode,
    });
}

/**
 * Create an Unauthenticated response for protected resource as per OAuth 2.0 PRM spec (RFC 9728).
 */
export function createOAuthProtectedResourceUnauthResponse(args: {
    siteRequestURL: URL;
    urlMode: 'url' | 'url-host';
}) {
    const { siteRequestURL, urlMode } = args;

    const matched = getMatchedProtectedResourceEndpoint(siteRequestURL);
    if (!matched) {
        throw new Error(
            `Attempted to create OAuth protected resource response for non-protected path: ${siteRequestURL.pathname}`
        );
    }

    const baseUrl =
        urlMode === 'url-host'
            ? siteRequestURL
            : new URL(`/url/${siteRequestURL.host}${siteRequestURL.pathname}`, GITBOOK_URL);

    const resourceMetadataUrl = baseUrl
        .toString()
        .replace(
            new RegExp(`${matched.endpoint}$`),
            `${OAUTH_PROTECTED_RESOURCE_METADATA_PATH}${matched.endpoint}`
        );

    return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
            'WWW-Authenticate': `Bearer${
                matched.realm ? ` realm="${matched.realm}",` : ''
            } resource_metadata="${resourceMetadataUrl}"`,
            'Cache-Control': 'no-store',
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}

/**
 * Check if the site request targets an OAuth protected resource.
 */
export function isOAuthProtectedResourceRequest(siteRequestURL: URL | NextRequest['nextUrl']) {
    return Boolean(getMatchedProtectedResourceEndpoint(siteRequestURL));
}

/**
 * Return the matched protected resource endpoint (if any).
 */
function getMatchedProtectedResourceEndpoint(siteRequestURL: URL | NextRequest['nextUrl']) {
    const matches = OAUTH_PROTECTED_RESOURCES.filter(({ endpoint }) =>
        siteRequestURL.pathname.endsWith(endpoint)
    ).sort((a, b) => b.endpoint.length - a.endpoint.length);

    return matches[0];
}

/**
 * Check if the site request targets the OAuth protected resource *metadata* document
 * e.g "/.well-known/oauth-protected-resource[/<resource>]?"
 */
export function isOAuthProtectedResourceMetadataRequest(
    siteRequestURL: URL | NextRequest['nextUrl']
) {
    return Boolean(getMatchedProtectedMetadataEndpoint(siteRequestURL));
}

/**
 * Return the matched protected endpoint entry for a metadata doc request (if any).
 */
function getMatchedProtectedMetadataEndpoint(siteRequestURL: URL | NextRequest['nextUrl']) {
    const matches = OAUTH_PROTECTED_RESOURCES.filter(({ endpoint }) =>
        siteRequestURL.pathname.endsWith(getOAuthProtectedResourceMetadataPath(endpoint))
    ).sort((a, b) => b.endpoint.length - a.endpoint.length);

    return matches[0];
}

/**
 * Build the metadata path for a protected endpoint.
 */
function getOAuthProtectedResourceMetadataPath(endpoint: string) {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${OAUTH_PROTECTED_RESOURCE_METADATA_PATH}${normalizedEndpoint}`;
}

/**
 * Return a visitor token provided by a OAuth client for a protected resource (e.g MCP request).
 */
export function getVisitorTokenForOAuthProtectedResource(args: {
    url: URL | NextRequest['nextUrl'];
    headers: Headers;
}) {
    const { url, headers } = args;

    // Check first if it is included in the headers otherwise fallback to query param.
    const fromAuthHeader = headers.get('Authorization');
    if (fromAuthHeader) {
        const match = fromAuthHeader.match(/^Bearer\s+(.+)$/i);
        if (match) {
            const token = match[1]?.trim();
            if (token) {
                return token;
            }
        }
    }

    const fromAccessTokenParam = url.searchParams.get('access_token');
    return fromAccessTokenParam;
}
