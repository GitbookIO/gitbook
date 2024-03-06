import type { NextRequest } from 'next/server';
import hash from 'object-hash';

const VISITOR_AUTH_PARAM = 'jwt_token';
const VISITOR_AUTH_COOKIE_ROOT = 'gitbook-visitor-token';

/**
 * The contents of the visitor authentication cookie.
 */
export type VisitorAuthCookieValue = {
    basePath: string;
    token: string;
};

/**
 * Get the visitor authentication token for the request. This token can either be in the
 * query parameters or stored as a cookie.
 */
export function getVisitorAuthToken(request: NextRequest, url: URL): string | undefined {
    return url.searchParams.get(VISITOR_AUTH_PARAM) ?? getVisitorAuthTokenFromCookies(request, url);
}

/**
 * Get the name of the visitor authentication cookie for a given base path.
 *
 * NOTE: The cookie names are unique per base path to avoid conflicts between
 * different content hosted on the same subdomain.
 */
export function getVisitorAuthCookieName(basePath: string): string {
    return `${VISITOR_AUTH_COOKIE_ROOT}~${hash(basePath)}`;
}

/**
 * Get the value of the visitor authentication cookie for a given base path and token.
 */
export function getVisitorAuthCookieValue(basePath: string, token: string): string {
    const value: VisitorAuthCookieValue = { basePath, token };
    return JSON.stringify(value);
}

/**
 * Normalize the URL by removing the visitor authentication token from the query parameters (if present).
 */
export function normalizeVisitorAuthURL(url: URL): URL {
    const withoutVAParam = new URL(url);
    withoutVAParam.searchParams.delete(VISITOR_AUTH_PARAM);
    return withoutVAParam;
}

/**
 * Find the visitor authentication token from the request cookies. This is done by
 * checking all cookies for a matching "visitor authentication cookie" and returning the
 * best possible match for the current URL.
 */
function getVisitorAuthTokenFromCookies(request: NextRequest, url: URL): string | undefined {
    const urlPathParts = url.pathname.split('/').filter(Boolean);
    const urlBasePath = urlPathParts.length === 0 ? null : `/${urlPathParts[0]}/`;
    /**
     * First, try to find a visitor authentication token for the current URL. The request could be
     * something like example.gitbook.io/foo/bar, and we want to find the token for the `/foo/` base path.
     * If we can't find a token for the current URL, we'll try to find a token for the `/` base path. These
     * are the only two possible base paths for a given URL for which we try to find a token.
     */
    const found = urlBasePath ? findVisitorAuthCookieForBasePath(request, urlBasePath) : null;
    return found ?? findVisitorAuthCookieForBasePath(request, '/');
}

/**
 * Loop through all cookies and find the visitor authentication token for a given base path.
 */
function findVisitorAuthCookieForBasePath(
    request: NextRequest,
    basePath: string,
): string | undefined {
    return Array.from(request.cookies).reduce<string | undefined>((acc, [name, cookie]) => {
        if (name === getVisitorAuthCookieName(basePath)) {
            const value = JSON.parse(cookie.value) as VisitorAuthCookieValue;
            if (value.basePath === basePath) {
                acc = value.token;
            }
        }
        return acc;
    }, undefined);
}
