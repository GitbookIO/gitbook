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
export function getVisitorAuthToken(
    request: NextRequest,
    url: URL | NextRequest['nextUrl'],
): string | VisitorAuthCookieValue | undefined {
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
 * Get all possible basePaths for a given URL. This is used to find the visitor
 * authentication cookie token.
 * It returns the longest one first, and the shortest one last.
 */
function getUrlBasePathCombinations(url: URL | NextRequest['nextUrl']): string[] {
    const parts = url.pathname.split('/').filter(Boolean);
    const baseNames = ['/'];

    for (let index = 0; index < parts.length; index++) {
        baseNames.push('/' + parts.slice(0, index + 1).join('/') + '/');
    }

    return baseNames.reverse();
}

/**
 * Find the visitor authentication token from the request cookies. This is done by
 * checking all cookies for a matching "visitor authentication cookie" and returning the
 * best possible match for the current URL.
 */
function getVisitorAuthTokenFromCookies(
    request: NextRequest,
    url: URL | NextRequest['nextUrl'],
): VisitorAuthCookieValue | undefined {
    const urlBasePaths = getUrlBasePathCombinations(url);
    // Try to find a visitor authentication token for the current URL. The request
    // for the content could be hosted on a base path like `/foo/v/bar` or `/foo` or just `/`
    // We keep trying to find with each of these base paths until we find a token.
    for (const basePath of urlBasePaths) {
        const found = findVisitorAuthCookieForBasePath(request, basePath);
        if (found) {
            return found;
        }
    }

    // couldn't find any token for the current URL
    return undefined;
}

/**
 * Loop through all cookies and find the visitor authentication token for a given base path.
 */
function findVisitorAuthCookieForBasePath(
    request: NextRequest,
    basePath: string,
): VisitorAuthCookieValue | undefined {
    return Array.from(request.cookies).reduce<VisitorAuthCookieValue | undefined>(
        (acc, [name, cookie]) => {
            if (name === getVisitorAuthCookieName(basePath)) {
                const value = JSON.parse(cookie.value) as VisitorAuthCookieValue;
                if (value.basePath === basePath) {
                    acc = value;
                }
            }
            return acc;
        },
        undefined,
    );
}
