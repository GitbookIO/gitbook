import { type JwtPayload, jwtDecode } from 'jwt-decode';
import { type NextRequest, NextResponse } from 'next/server';
import hash from 'object-hash';

const VISITOR_AUTH_PARAM = 'jwt_token';
const VISITOR_PARAM_PREFIX = 'visitor.';
export const VISITOR_TOKEN_COOKIE = 'gitbook-visitor-token';
const VISITOR_UNSIGNED_CLAIMS_PREFIX = 'gitbook-visitor-public';

/**
 * Typing for a cookie, matching the internal type of Next.js.
 */
export type ResponseCookie = {
    name: string;
    value: string;
    options?: Partial<{
        httpOnly: boolean;
        sameSite: boolean | 'lax' | 'strict' | 'none' | undefined;
        secure: boolean;
        maxAge: number;
    }>;
};

export type ResponseCookies = ResponseCookie[];
export type RequestCookies = ResponseCookies;

/**
 * The contents of the visitor authentication cookie.
 */
type VisitorAuthCookieValue = {
    basePath: string;
    token: string;
};

type ClaimPrimitive =
    | string
    | number
    | boolean
    | null
    | undefined
    | { [key: string]: ClaimPrimitive }
    | ClaimPrimitive[];

/**
 * The result of a visitor data lookup that can include:
 *   - a visitor token (JWT)
 *   - a record of visitor public/unsigned claims (JSON object)
 *   - a session cookie response to persist any visitor query params across navigations.
 */
export type VisitorDataLookup = {
    visitorToken: VisitorTokenLookup;
    unsignedClaims: Record<string, ClaimPrimitive>;
    visitorParamsCookie: ResponseCookie | undefined;
};

/**
 * The result of a visitor token lookup.
 */
export type VisitorTokenLookup =
    | {
          /** A visitor token was found in the URL. */
          source: 'url';
          token: string;
      }
    | {
          /** A visitor auth token was found in a VA cookie */
          source: 'visitor-auth-cookie';
          basePath: string;
          token: string;
      }
    | {
          /** A visitor token (not auth) was found in a cookie. */
          source: 'gitbook-visitor-cookie';
          token: string;
      }
    /** Not visitor token was found */
    | undefined;

/**
 * Get the visitor data for the request potentially including:
 *   - a JWT token that may contain signed claims or can be used for VA authentication.
 *   - a record of the unsigned claims passed via a cookie or visitor.* params.
 *   - a session cookie response that is used to persist any visitor.* params that were passed via the site URL.
 */
export function getVisitorData({
    cookies,
    url,
}: {
    cookies: RequestCookies;
    url: URL | NextRequest['nextUrl'];
}): VisitorDataLookup {
    const visitorToken = getVisitorToken({ cookies, url });
    const unsignedClaims = getVisitorUnsignedClaims({ cookies, url });
    const visitorParamsCookie = getResponseCookieForVisitorParams(unsignedClaims.fromVisitorParams);

    return {
        visitorToken,
        unsignedClaims: unsignedClaims.all,
        visitorParamsCookie,
    };
}

/**
 * Get the visitor token for the request. This token can either be in the
 * query parameters or stored as a cookie.
 */
export function getVisitorToken({
    cookies,
    url,
}: {
    cookies: RequestCookies;
    url: URL | NextRequest['nextUrl'];
}): VisitorTokenLookup {
    const fromUrl = url.searchParams.get(VISITOR_AUTH_PARAM);

    // Allow the empty string to come through
    if (fromUrl !== null && fromUrl !== undefined) {
        return { source: 'url', token: fromUrl };
    }

    const visitorAuthToken = getVisitorAuthTokenFromCookies(cookies, url);
    if (visitorAuthToken) {
        return { source: 'visitor-auth-cookie', ...visitorAuthToken };
    }

    const visitorCustomToken = getVisitorCustomTokenFromCookies(cookies);
    if (visitorCustomToken) {
        return { source: 'gitbook-visitor-cookie', token: visitorCustomToken };
    }
}

/**
 * Get the visitor unsigned/public claims for the request. They can either be in `visitor.` query
 * parameters or stored in special `gitbook-visitor-public-*` cookies.
 */
export function getVisitorUnsignedClaims(args: {
    cookies: RequestCookies;
    url: URL | NextRequest['nextUrl'];
}): {
    /**
     * The unsigned claims coming from both `gitbook-visitor-public` cookies and `visitor.*` query params.
     */
    all: Record<string, ClaimPrimitive>;
    /**
     * The unsigned claims from the `visitor.*` query params.
     */
    fromVisitorParams: Record<string, ClaimPrimitive>;
} {
    const { cookies, url } = args;
    const claims: Record<string, ClaimPrimitive> = {};
    const searchParamsClaims: Record<string, ClaimPrimitive> = {};

    for (const cookie of cookies) {
        if (cookie.name.startsWith(VISITOR_UNSIGNED_CLAIMS_PREFIX)) {
            try {
                const parsed = JSON.parse(cookie.value);
                if (typeof parsed === 'object' && parsed !== null) {
                    Object.assign(claims, parsed);
                }
            } catch {
                console.warn(`Invalid JSON in unsigned claim cookie "${cookie.name}"`);
            }
        }
    }

    for (const [key, value] of url.searchParams.entries()) {
        if (key.startsWith(VISITOR_PARAM_PREFIX)) {
            const claimPath = key.substring(VISITOR_PARAM_PREFIX.length);
            const claimValue = parseVisitorQueryParamValue(value);

            setVisitorClaimByPath(claims, claimPath, claimValue);
            setVisitorClaimByPath(searchParamsClaims, claimPath, claimValue);
        }
    }

    return { all: claims, fromVisitorParams: searchParamsClaims };
}

/**
 * Set the value of claims in a claims object at a specific path.
 */
function setVisitorClaimByPath(
    claims: Record<string, ClaimPrimitive>,
    keyPath: string,
    value: ClaimPrimitive
): void {
    const keys = keyPath.split('.');
    let current = claims;

    for (let index = 0; index < keys.length; index++) {
        const key = keys[index]!;

        if (index === keys.length - 1) {
            current[key] = value;
        } else {
            if (!(key in current) || !isClaimPrimitiveObject(current[key])) {
                current[key] = {};
            }

            current = current[key];
        }
    }
}

function isClaimPrimitiveObject(value: unknown): value is Record<string, ClaimPrimitive> {
    return typeof value === 'object' && value !== null;
}

/**
 * Parse the value expected in a `visitor.` URL query parameter.
 */
function parseVisitorQueryParamValue(value: string): ClaimPrimitive {
    if (value === 'true') {
        return true;
    }

    if (value === 'false') {
        return false;
    }

    if (value === 'null') {
        return null;
    }

    if (value === 'undefined') {
        return undefined;
    }

    const num = Number(value);
    if (!Number.isNaN(num) && value.trim() !== '') {
        return num;
    }

    try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed;
        }
    } catch {}

    return value;
}

/**
 * Returns to cookie response to use in order to persist visitor params that were passed to the URL.
 */
function getResponseCookieForVisitorParams(
    visitorParamsClaims: Record<string, ClaimPrimitive>
): ResponseCookie | undefined {
    if (Object.keys(visitorParamsClaims).length === 0) {
        return undefined;
    }

    return {
        name: VISITOR_UNSIGNED_CLAIMS_PREFIX,
        value: JSON.stringify(visitorParamsClaims),
        options: {
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
            secure: process.env.NODE_ENV === 'production',
        },
    };
}

/**
 * Return the lookup result for content served with visitor auth.
 */
export function getResponseCookiesForVisitorAuth(
    basePath: string,
    visitorTokenLookup: VisitorTokenLookup
): ResponseCookies {
    if (!visitorTokenLookup) {
        return [];
    }

    let decoded: JwtPayload;
    try {
        decoded = jwtDecode(visitorTokenLookup.token);
    } catch (error) {
        console.error('Error decoding visitor token', error);
        return [];
    }

    /**
     * If the visitor token has been retrieve from the URL, or if its a VA cookie and the basePath is the same, set it
     * as a cookie on the response.
     *
     * Note that we do not re-store the gitbook-visitor-cookie in another cookie, to maintain a single source of truth.
     */
    if (
        visitorTokenLookup?.source === 'url' ||
        (visitorTokenLookup?.source === 'visitor-auth-cookie' &&
            visitorTokenLookup.basePath === basePath)
    ) {
        return [
            {
                name: getVisitorAuthCookieName(basePath),
                value: getVisitorAuthCookieValue(basePath, visitorTokenLookup.token),
                options: {
                    httpOnly: true,
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: getVisitorAuthCookieMaxAge(decoded),
                },
            },
        ];
    }

    return [];
}

/**
 * Get the name of the visitor authentication cookie for a given base path.
 *
 * NOTE: The cookie names are unique per base path to avoid conflicts between
 * different content hosted on the same subdomain.
 */
export function getVisitorAuthCookieName(basePath: string): string {
    return getPathScopedCookieName(VISITOR_TOKEN_COOKIE, basePath);
}

/**
 * Get the value of the visitor authentication cookie for a given base path and token.
 */
export function getVisitorAuthCookieValue(basePath: string, token: string): string {
    const value: VisitorAuthCookieValue = { basePath, token };
    return JSON.stringify(value);
}

/**
 * Normalize the URL by removing the visitor JWT token and visitor.* param from the query parameters (if present).
 */
export function normalizeVisitorURL(url: URL): URL {
    const withoutVisitorParamsURL = new URL(url);
    if (url.searchParams.has(VISITOR_AUTH_PARAM)) {
        withoutVisitorParamsURL.searchParams.delete(VISITOR_AUTH_PARAM);
    }

    for (const [urlParam] of url.searchParams.entries()) {
        if (urlParam.startsWith(VISITOR_PARAM_PREFIX)) {
            withoutVisitorParamsURL.searchParams.delete(urlParam);
        }
    }

    return withoutVisitorParamsURL;
}

/**
 * Get the name of a cookie to be scoped to a given path.
 * It is used to avoid conflict between used of similar cookies under a same domain.
 */
export function getPathScopedCookieName(prefix: string, path: string): string {
    return `${prefix}~${hash(path)}`;
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
        baseNames.push(`/${parts.slice(0, index + 1).join('/')}/`);
        // For backwards compatibility, we also add the base path with the `/v/` prefix if it's not already there
        if (parts.length > 1 && index >= 1 && ![parts[0], parts[1]].includes('v')) {
            baseNames.push(`/${parts.slice(0, 1)}/v/${parts.slice(1, index + 1).join('/')}/`);
        }
    }

    return baseNames.reverse();
}

/**
 * Find the visitor authentication token from the request cookies. This is done by
 * checking all cookies for a matching "visitor authentication cookie" and returning the
 * best possible match for the current URL.
 */
function getVisitorAuthTokenFromCookies(
    cookies: RequestCookies,
    url: URL | NextRequest['nextUrl']
): VisitorAuthCookieValue | undefined {
    const urlBasePaths = getUrlBasePathCombinations(url);
    // Try to find a visitor authentication token for the current URL. The request
    // for the content could be hosted on a base path like `/foo/v/bar` or `/foo` or just `/`
    // We keep trying to find with each of these base paths until we find a token.
    for (const basePath of urlBasePaths) {
        const found = findVisitorAuthCookieForBasePath(cookies, basePath);
        if (found) {
            return found;
        }
    }

    // couldn't find any token for the current URL
    return undefined;
}

/**
 * Return the value of a custom visitor cookie that can be set by third party backends
 * when they authenticate their users off flow to relay information in the form of claims
 * about the visitor.
 *
 * The cookie should contain as value a JWT encoded token that contains the claims of the visitor.
 */
function getVisitorCustomTokenFromCookies(cookies: RequestCookies): string | undefined {
    const visitorCustomCookie = cookies.find((cookie) => cookie.name === VISITOR_TOKEN_COOKIE);
    return visitorCustomCookie ? visitorCustomCookie.value : undefined;
}

/**
 * Loop through all cookies and find the visitor authentication token for a given base path.
 */
function findVisitorAuthCookieForBasePath(
    cookies: RequestCookies,
    basePath: string
): VisitorAuthCookieValue | undefined {
    return cookies.reduce<VisitorAuthCookieValue | undefined>((acc, cookie) => {
        if (cookie.name === getVisitorAuthCookieName(basePath)) {
            const value = JSON.parse(cookie.value) as VisitorAuthCookieValue;
            if (value.basePath === basePath) {
                acc = value;
            }
        }
        return acc;
    }, undefined);
}

/**
 * Get the max age to store a visitor auth token in a cookie.
 * We want to store the token for as long as it's valid, but at least 1 minute.
 * If an invalid token is passed to the API, the API will return a redirect to the auth flow.
 */
export function getVisitorAuthCookieMaxAge(decoded: JwtPayload): number {
    const defaultMaxAge = 7 * 24 * 60 * 60; // 7 days
    const minMaxAge = 60; // 1 min
    const exp = decoded.exp;

    if (typeof exp === 'number') {
        const now = Math.floor(new Date().getTime() / 1000);
        return Math.max(exp - now, minMaxAge);
    }

    return defaultMaxAge;
}

/**
 * Handler for the /~gitbook/visitor middleware route to expose visitor data.
 */
export function serveVisitorClaimsDataRequest(request: NextRequest, siteRequestURL: URL) {
    const { visitorToken, unsignedClaims } = getVisitorData({
        cookies: request.cookies.getAll(),
        url: siteRequestURL,
    });

    if (!visitorToken && !Object.keys(unsignedClaims).length) {
        return NextResponse.json({ visitor: { claims: { unsigned: {} } } });
    }

    const visitorClaims = {
        visitor: {
            claims: {
                unsigned: unsignedClaims,
            },
        },
    };

    if (!visitorToken) {
        return NextResponse.json(visitorClaims);
    }

    try {
        const decodedJwtPayload = jwtDecode(visitorToken.token);
        return NextResponse.json({
            visitor: {
                claims: {
                    ...visitorClaims.visitor.claims,
                    ...decodedJwtPayload,
                },
            },
        });
    } catch (error) {
        console.warn('Error decoding visitor token', error);
    }

    return NextResponse.json(visitorClaims);
}
