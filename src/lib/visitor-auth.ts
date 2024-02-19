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
 * Find the visitor authentication token from the request cookies. This is done by
 * checking all cookies for a matching "visitor authentication cookie" and returning the
 * best possible match for the current URL.
 */
function getVisitorAuthTokenFromCookies(request: NextRequest, url: URL): string | undefined {
    const urlBasePath = url.pathname.split('/').filter(Boolean)[0] ?? '';

    return Array.from(request.cookies).reduce<string | undefined>((acc, [name, cookie]) => {
        if (name === getVisitorAuthCookieName(urlBasePath)) {
            const value = JSON.parse(cookie.value) as VisitorAuthCookieValue;
            if (value.basePath === urlBasePath) {
                acc = value.token;
            }
        }

        return acc;
    }, undefined);
}
