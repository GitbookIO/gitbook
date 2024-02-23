import { GitBookAPI } from '@gitbook/api';
import * as Sentry from '@sentry/nextjs';
import assertNever from 'assert-never';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextResponse, NextRequest } from 'next/server';

import {
    PublishedContentWithCache,
    api,
    getPublishedContentByUrl,
    getSpace,
    getSpaceContent,
    userAgent,
    withAPI,
} from '@/lib/api';
import { race } from '@/lib/async';
import { buildVersion } from '@/lib/build';
import { createContentSecurityPolicyNonce, getContentSecurityPolicy } from '@/lib/csp';
import { getURLLookupAlternatives, normalizeURL } from '@/lib/middleware';
import {
    getVisitorAuthCookieName,
    getVisitorAuthCookieValue,
    getVisitorAuthToken,
    normalizeVisitorAuthURL,
} from '@/lib/visitor-auth';

export const config = {
    matcher:
        '/((?!_next/static|_next/image|~gitbook/revalidate|~gitbook/image|~gitbook/monitoring).*)',
    skipTrailingSlashRedirect: true,
};

type URLLookupMode =
    /**
     * Only a single space is served on this instance, defined by the env GITBOOK_SPACE_ID.
     * This mode is useful when self-hosting a single space.
     */
    | 'single'
    /**
     * Spaces are located using the incoming URL (using forwarded host headers).
     * This mode is the default one when serving on the GitBook infrastructure.
     */
    | 'multi'
    /**
     * Spaces are located using the first segments of the url (open.gitbook.com/docs.mycompany.com).
     * This mode is the default one when developing.
     */
    | 'multi-path'
    /**
     * Spaces are located using an ID stored in the first segments of the URL (open.gitbook.com/~space/:id/).
     * This mode is automatically detected and doesn't need to be configured.
     * When this mode is used, an authentication token should be passed as a query parameter (`token`).
     */
    | 'multi-id';

export type LookupResult = PublishedContentWithCache & {
    /** API endpoint to use for the content post lookup */
    apiEndpoint?: string;
    /** Cookies to store on the response */
    cookies?: Record<
        string,
        {
            value: string;
            options?: Partial<ResponseCookie>;
        }
    >;
};

/**
 * Middleware to lookup the space to render.
 * It takes as input a request with an URL, and a set of headers:
 *   - x-gitbook-api: the API endpoint to use, if undefined, the default one is used
 *   - x-gitbook-basepath: base in the path that should be ignored for routing
 *
 * The middleware also takes care of persisting the visitor authentication state.
 */
export async function middleware(request: NextRequest) {
    const { url, mode } = getInputURL(request);

    console.log(`handling request with cookies ${request.cookies.toString()}`);

    Sentry.setTag('url', url.toString());
    Sentry.setContext('request', {
        method: request.method,
        url: url.toString(),
        rawRequestURL: request.url,
        userAgent: userAgent(),
    });

    // Redirect to normalize the URL
    const normalized = normalizeURL(url);
    if (normalized.toString() !== url.toString()) {
        return NextResponse.redirect(normalized.toString());
    }

    // The API endpoint can be passed as a header, making it possible to use the same GitBook Open target
    // accross multiple GitBook instances.
    let apiEndpoint = request.headers.get('x-gitbook-api') ?? process.env.GITBOOK_API_URL;
    const originBasePath = request.headers.get('x-gitbook-basepath') ?? '';

    const inputURL = stripURLBasePath(url, originBasePath);

    const resolved = await withAPI(
        new GitBookAPI({
            endpoint: apiEndpoint,
            authToken: process.env.GITBOOK_API_TOKEN,
            userAgent: userAgent(),
        }),
        () => lookupSpaceForURL(mode, request, inputURL),
    );
    if ('error' in resolved) {
        return new NextResponse(resolved.error.message, {
            status: resolved.error.code,
            headers: {
                'x-gitbook-version': buildVersion(),
            },
        });
    }

    if ('redirect' in resolved) {
        console.log(`redirecting (${resolved.target}) to ${resolved.redirect}`);
        return writeCookies(NextResponse.redirect(resolved.redirect), resolved.cookies);
    }

    // Make sure the URL is clean of any va token after a successful lookup
    // The token is stored in a cookie that is set on the redirect response
    const normalizedVA = normalizeVisitorAuthURL(normalized);
    if (normalizedVA.toString() !== normalized.toString()) {
        console.log(`redirecting to ${normalizedVA.toString()}`);
        return writeCookies(NextResponse.redirect(normalizedVA.toString()), resolved.cookies);
    }

    Sentry.setTag('space', resolved.space);
    Sentry.setContext('content', {
        space: resolved.space,
        changeRequest: resolved.changeRequest,
        revision: resolved.revision,
    });

    // Because of how Next will encode, we need to encode ourselves the pathname before reriting to it.
    const rewritePathname = normalizePathname(encodePathname(resolved.pathname));

    console.log(`${request.method} (${resolved.space}) ${rewritePathname}`);

    // Resolution might have changed the API endpoint
    apiEndpoint = resolved.apiEndpoint ?? apiEndpoint;

    const nonce = createContentSecurityPolicyNonce();
    const csp = await withAPI(
        new GitBookAPI({
            endpoint: apiEndpoint,
            authToken: resolved.apiToken,
            userAgent: userAgent(),
        }),
        async () => {
            const content = await getSpaceContent({
                spaceId: resolved.space,
            });
            return getContentSecurityPolicy(content.scripts, nonce);
        },
    );

    const headers = new Headers(request.headers);
    // https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
    headers.set('x-nonce', nonce);
    headers.set('content-security-policy', csp);
    // Pass a x-forwarded-host and origin to ensure Next doesn't block server actions when proxied
    headers.set('x-forwarded-host', inputURL.host);
    headers.set('origin', inputURL.origin);
    headers.set('x-gitbook-token', resolved.apiToken);
    headers.set('x-gitbook-mode', mode);
    headers.set('x-gitbook-origin-basepath', originBasePath);
    headers.set('x-gitbook-basepath', joinPath(originBasePath, resolved.basePath));
    headers.set('x-gitbook-content-space', resolved.space);
    if (resolved.revision) {
        headers.set('x-gitbook-content-revision', resolved.revision);
    }
    if (resolved.changeRequest) {
        headers.set('x-gitbook-content-changerequest', resolved.changeRequest);
    }

    if (apiEndpoint) {
        headers.set('x-gitbook-api', apiEndpoint);
    }

    const target = new URL(rewritePathname, request.nextUrl.toString());
    target.search = url.search;

    const response = writeCookies(
        NextResponse.rewrite(target, {
            request: {
                headers,
            },
        }),
        resolved.cookies,
    );

    response.headers.set('x-gitbook-version', buildVersion());

    // Add Content Security Policy header
    response.headers.set('content-security-policy', csp);

    if (process.env.NODE_ENV !== 'development' && resolved.cacheMaxAge) {
        const cacheControl = `public, max-age=60, s-maxage=${resolved.cacheMaxAge}, stale-while-revalidate=60, stale-if-error=0`;
        response.headers.set('cache-control', cacheControl);
        response.headers.set('Cloudflare-CDN-Cache-Control', cacheControl);
    }

    if (resolved.cacheTags && resolved.cacheTags.length > 0) {
        response.headers.set('cache-tag', resolved.cacheTags.join(','));
    }

    return response;
}

/**
 * Compute the input URL the user is trying to access.
 */
function getInputURL(request: NextRequest): { url: URL; mode: URLLookupMode } {
    const url = new URL(request.url);
    let mode: URLLookupMode =
        (process.env.GITBOOK_MODE as URLLookupMode | undefined) ?? 'multi-path';

    // When developing locally using something.localhost:3000, the url only contains http://localhost:3000
    if (url.hostname === 'localhost') {
        url.host = request.headers.get('host') ?? url.hostname;
    }

    // When request is proxied, the host is passed in the x-forwarded-host header
    const xForwardedHost = request.headers.get('x-forwarded-host');
    if (xForwardedHost) {
        url.port = '';
        url.host = xForwardedHost;
    }

    // When request is proxied by the GitBook infrastructure, we always force the mode as 'multi'.
    const xGitbookHost = request.headers.get('x-gitbook-host');
    if (xGitbookHost) {
        mode = 'multi';
        url.port = '';
        url.host = xGitbookHost;
    }

    // When request started with ~space/:id, we force the mode as 'multi-id'.
    if (url.pathname.startsWith('/~space/')) {
        mode = 'multi-id';
    }

    return { url, mode };
}

async function lookupSpaceForURL(
    mode: URLLookupMode,
    request: NextRequest,
    url: URL,
): Promise<LookupResult> {
    switch (mode) {
        case 'single': {
            return await lookupSpaceInSingleMode(url);
        }
        case 'multi': {
            return await lookupSpaceInMultiMode(request, url);
        }
        case 'multi-path': {
            return await lookupSpaceInMultiPathMode(request, url);
        }
        case 'multi-id': {
            return await lookupSpaceInMultiIdMode(request, url);
        }
        default:
            assertNever(mode);
    }
}

/**
 * GITBOOK_MODE=single
 * When serving a single space, configured using GITBOOK_SPACE_ID and GITBOOK_TOKEN.
 */
async function lookupSpaceInSingleMode(url: URL): Promise<LookupResult> {
    const spaceId = process.env.GITBOOK_SPACE_ID;
    if (!spaceId) {
        throw new Error(
            `Missing GITBOOK_SPACE_ID environment variable. It should be passed when using GITBOOK_MODE=single.`,
        );
    }

    const apiToken = process.env.GITBOOK_TOKEN;
    if (!apiToken) {
        throw new Error(
            `Missing GITBOOK_TOKEN environment variable. It should be passed when using GITBOOK_MODE=single.`,
        );
    }

    return {
        space: spaceId,
        basePath: '',
        pathname: url.pathname,
        apiToken,
    };
}

/**
 * GITBOOK_MODE=multi
 * When serving multi spaces based on the current URL.
 */
async function lookupSpaceInMultiMode(request: NextRequest, url: URL): Promise<LookupResult> {
    const visitorAuthToken = getVisitorAuthToken(request, url);
    const lookup = await lookupSpaceByAPI(url, visitorAuthToken);
    return {
        ...lookup,
        ...('basePath' in lookup && visitorAuthToken
            ? getLookupResultForVisitorAuth(lookup.basePath, visitorAuthToken)
            : {}),
    };
}

/**
 * GITBOOK_MODE=multi-id
 * When serving multi spaces with the ID passed in the path.
 */
async function lookupSpaceInMultiIdMode(request: NextRequest, url: URL): Promise<LookupResult> {
    // Extract the iD from the path
    const pathSegments = url.pathname.slice(1).split('/');
    if (pathSegments[0] !== '~space') {
        return {
            error: {
                code: 400,
                message: `Missing space ID in the path`,
            },
        };
    }
    const spaceId = pathSegments[1];
    if (!spaceId) {
        return {
            error: {
                code: 400,
                message: `Missing space ID in the path`,
            },
        };
    }

    // Get the auth token from the URL query
    const AUTH_TOKEN_QUERY = 'token';
    const AUTH_TOKEN_COOKIE = 'gitbook-token';

    const apiToken =
        url.searchParams.get(AUTH_TOKEN_QUERY) ??
        decodeGitBookTokenCookie(spaceId, request.cookies.get(AUTH_TOKEN_COOKIE)?.value);
    if (!apiToken) {
        return {
            error: {
                code: 400,
                message: `Missing token query parameter`,
            },
        };
    }

    const apiEndpoint = url.searchParams.get('api') ?? api().endpoint;
    // Verify access to the space to avoid leaking cached data in this mode
    // (the cache is not dependend on the auth token, so it could leak data)
    await withAPI(
        new GitBookAPI({
            endpoint: apiEndpoint,
            authToken: apiToken,
            userAgent: userAgent(),
        }),
        () => getSpace.revalidate(spaceId),
    );

    const cookies = {
        [AUTH_TOKEN_COOKIE]: {
            value: encodeGitBookTokenCookie(spaceId, apiToken),
        },
    };

    // Get rid of the token from the URL
    if (url.searchParams.has(AUTH_TOKEN_QUERY)) {
        const withoutToken = new URL(url);
        withoutToken.searchParams.delete(AUTH_TOKEN_QUERY);

        return {
            target: 'external',
            redirect: withoutToken.toString(),
            cookies,
        };
    }

    return {
        space: spaceId,
        basePath: `/~space/${spaceId}`,
        pathname: normalizePathname(pathSegments.slice(2).join('/')),
        apiToken,
        apiEndpoint,
        cookies,
    };
}

/**
 * GITBOOK_MODE=multi-path
 * When serving multi spaces with the url passed in the path.
 */
async function lookupSpaceInMultiPathMode(request: NextRequest, url: URL): Promise<LookupResult> {
    // Skip useless requests
    if (
        url.pathname === '/favicon.ico' ||
        url.pathname === '/robots.txt' ||
        url.pathname === '/sitemap.xml'
    ) {
        return {
            error: {
                code: 404,
                message: `favicon.ico, robots.txt, sitemap.xml should be accessed under a content`,
            },
        };
    }
    // Only match something that starts with a domain like
    if (!url.pathname.match(/^.+\..+/)) {
        return {
            error: {
                code: 404,
                message: `Invalid URL in the path, should start with a domain`,
            },
        };
    }

    const targetStr = `https://${url.pathname}`;

    if (!URL.canParse(targetStr)) {
        return {
            error: {
                code: 404,
                message: `Invalid URL in the path`,
            },
        };
    }
    const target = new URL(targetStr);
    const visitorAuthToken = getVisitorAuthToken(request, target);

    const lookup = await lookupSpaceByAPI(target, visitorAuthToken);
    if ('error' in lookup) {
        return lookup;
    }

    if ('redirect' in lookup) {
        if (lookup.target === 'content') {
            // Redirect to the content URL in the same application
            const redirect = new URL(lookup.redirect);

            return {
                target: 'content',
                redirect: new URL(
                    `/` + redirect.hostname + redirect.pathname + redirect.search,
                    url,
                ).toString(),
            };
        }

        return lookup;
    }

    return {
        ...lookup,
        basePath: joinPath(target.host, lookup.basePath),
        ...('basePath' in lookup && visitorAuthToken
            ? getLookupResultForVisitorAuth(lookup.basePath, visitorAuthToken)
            : {}),
    };
}

/**
 * Lookup a space by its URL using the GitBook API.
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 */
async function lookupSpaceByAPI(
    url: URL,
    visitorAuthToken: string | undefined,
): Promise<LookupResult> {
    const lookupAlternatives = getURLLookupAlternatives(stripURLSearch(url));

    console.log(
        `lookup content for url "${url.toString()}", with ${
            lookupAlternatives.length
        } alternatives`,
    );

    const startTime = Date.now();

    const result = await race(lookupAlternatives, async (alternative, { signal }) => {
        const data = await getPublishedContentByUrl(alternative.url, visitorAuthToken, {
            signal,
        });

        if ('error' in data) {
            if (alternative.primary) {
                // We only return an error for the primary alternative (full URL),
                // as other parts could result in errors due to the URL being incomplete (share links, etc).
                return data;
            }
            return null;
        }

        if ('redirect' in data) {
            if (alternative.url === url.toString()) {
                return data;
            }

            return null;
        }

        return {
            space: data.space,
            changeRequest: data.changeRequest,
            revision: data.revision,
            basePath: data.basePath,
            pathname: joinPath(data.pathname, alternative.extraPath),
            apiToken: data.apiToken,
            cacheMaxAge: data.cacheMaxAge,
            cacheTags: data.cacheTags,
        } as PublishedContentWithCache;
    });

    console.log(`lookup took ${Date.now() - startTime}ms`);
    return (
        result ?? {
            error: {
                code: 404,
                message: `No content found`,
            },
        }
    );
}

/**
 * Return the lookup result for content served with visitor auth. It basically disables caching
 * and sets a cookie with the visitor auth token.
 */
function getLookupResultForVisitorAuth(
    basePath: string,
    visitorAuthToken: string,
): Partial<LookupResult> {
    return {
        // No caching for content served with visitor auth
        cacheMaxAge: undefined,
        cacheTags: [],
        cookies: {
            [getVisitorAuthCookieName(basePath)]: {
                value: getVisitorAuthCookieValue(basePath, visitorAuthToken),
                options: {
                    httpOnly: true,
                },
            },
        },
    };
}

function joinPath(...parts: string[]): string {
    return parts.join('/').replace(/\/+/g, '/');
}

function stripBasePath(pathname: string, basePath: string): string {
    if (basePath === '') {
        return pathname;
    }

    if (!pathname.startsWith(basePath)) {
        throw new Error(`Invalid pathname ${pathname} for basePath ${basePath}`);
    }

    pathname = pathname.slice(basePath.length);
    if (!pathname.startsWith('/')) {
        pathname = '/' + pathname;
    }

    return pathname;
}

function stripURLBasePath(url: URL, basePath: string): URL {
    const stripped = new URL(url.toString());
    stripped.pathname = stripBasePath(stripped.pathname, basePath);
    return stripped;
}

function normalizePathname(pathname: string): string {
    if (!pathname.startsWith('/')) {
        pathname = '/' + pathname;
    }

    return pathname;
}

function stripURLSearch(url: URL): URL {
    const stripped = new URL(url.toString());
    stripped.search = '';
    return stripped;
}

function encodePathname(pathname: string): string {
    return pathname.split('/').map(encodeURIComponent).join('/');
}

function decodeGitBookTokenCookie(spaceId: string, cookie: string | undefined): string | undefined {
    if (!cookie) {
        return;
    }

    try {
        const parsed = JSON.parse(cookie);
        if (typeof parsed.t === 'string' && parsed.s === spaceId) {
            return parsed.t;
        }
    } catch (error) {
        // ignore
    }
}

function encodeGitBookTokenCookie(spaceId: string, token: string): string {
    return JSON.stringify({ s: spaceId, t: token });
}

function writeCookies<R extends NextResponse>(
    response: R,
    cookies: Record<
        string,
        {
            value: string;
            options?: Partial<ResponseCookie>;
        }
    > = {},
): R {
    Object.entries(cookies).forEach(([key, { value, options }]) => {
        response.cookies.set(key, value, options);
    });

    return response;
}
