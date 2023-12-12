import { PublishedContentLookup } from '@gitbook/api';
import { NextResponse, NextRequest } from 'next/server';

import { getPublishedContentByUrl } from './lib/api';
import { waitForCache } from './lib/cache';

export const config = {
    matcher: '/((?!_next/static|_next/image).*)',
    skipTrailingSlashRedirect: true,
};

const VISITOR_AUTH_PARAM = 'jwt_token';
const VISITOR_AUTH_COOKIE = 'gitbook-visitor-token';

type URLLookupMode = 'single' | 'multi' | 'multi-path';

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

    // The visitor authentication can either be passed as a query parameter
    // or can be stored in a cookie after the initial auth.
    const visitorAuthToken =
        url.searchParams.get(VISITOR_AUTH_PARAM) ?? request.cookies.get(VISITOR_AUTH_COOKIE)?.value;
    url.searchParams.delete(VISITOR_AUTH_PARAM);

    // The API endpoint can be passed as a header
    const apiEndpoint = request.headers.get('x-gitbook-api') ?? process.env.GITBOOK_API_URL;
    const proxyBasePath = request.headers.get('x-gitbook-basepath') ?? '';

    const inputURL = stripURLBasePath(stripURLSearch(url), proxyBasePath);

    console.log('resolving', inputURL.toString());

    const resolved = await lookupSpaceForURL(mode, apiEndpoint, inputURL, visitorAuthToken);
    if (!resolved) {
        return new NextResponse(`Not found`, {
            status: 404,
        });
    }

    if ('redirect' in resolved) {
        console.log(`redirecting (${resolved.target}) to ${resolved.redirect}`);
        return NextResponse.redirect(resolved.redirect);
    }

    console.log(`rendering ${resolved.space} ${resolved.pathname}`);

    const headers = new Headers(request.headers);

    // Pass a x-forwarded-host and origin to ensure Next doesn't block server actions when proxied
    headers.set('x-forwarded-host', inputURL.host);
    headers.set('origin', inputURL.origin);
    headers.set('x-gitbook-token', resolved.apiToken);
    headers.set('x-gitbook-basepath', joinPath(proxyBasePath, resolved.basePath));
    if (apiEndpoint) {
        headers.set('x-gitbook-api', apiEndpoint);
    }

    const target = new URL(`/${resolved.space}${resolved.pathname}`, request.nextUrl.toString());
    target.search = url.search;

    const response = NextResponse.rewrite(target, {
        request: {
            headers,
        },
    });

    // When content is authenticated, we store the state in a cookie.
    if (visitorAuthToken) {
        response.cookies.set(VISITOR_AUTH_COOKIE, visitorAuthToken);
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

    // When request is proxied by the GitBook infrastructure, we always force the mode as 'multi
    const xGitbookHost = request.headers.get('x-gitbook-host');
    if (xGitbookHost) {
        mode = 'multi';
        url.port = '';
        url.host = xGitbookHost;
    }

    return { url, mode };
}

async function lookupSpaceForURL(
    mode: URLLookupMode,
    apiEndpoint: string | undefined,
    url: URL,
    visitorAuthToken: string | undefined,
): Promise<PublishedContentLookup | null> {
    switch (mode) {
        case 'single': {
            return await lookupSpaceInSingleMode(url);
        }
        case 'multi': {
            return await lookupSpaceInMultiMode(url, apiEndpoint, visitorAuthToken);
        }
        case 'multi-path': {
            return await lookupSpaceInMultiPathMode(url, apiEndpoint, visitorAuthToken);
        }
        default:
            throw new Error(
                `Invalid GITBOOK_MODE environment variable. It should be one of: single, multi, multipath.`,
            );
    }
}

/**
 * GITBOOK_MODE=single
 * When serving a single space, configured using GITBOOK_SPACE_ID and GITBOOK_TOKEN.
 */
async function lookupSpaceInSingleMode(url: URL): Promise<PublishedContentLookup | null> {
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
        basePath: ``,
        pathname: url.pathname,
        apiToken,
    };
}

/**
 * GITBOOK_MODE=multi
 * When serving multi spaces based on the current URL.
 */
async function lookupSpaceInMultiMode(
    url: URL,
    apiEndpoint: string | undefined,
    visitorAuthToken: string | undefined,
): Promise<PublishedContentLookup | null> {
    return lookupSpaceByAPI(url, apiEndpoint, visitorAuthToken);
}

/**
 * GITBOOK_MODE=multi-path
 * When serving multi spaces with the url passed in the path.
 */
async function lookupSpaceInMultiPathMode(
    url: URL,
    apiEndpoint: string | undefined,
    visitorAuthToken: string | undefined,
): Promise<PublishedContentLookup | null> {
    const targetStr = `https://${url.pathname}`;

    if (!URL.canParse(targetStr)) {
        throw new Error(`Invalid URL in the path`);
    }
    const target = new URL(targetStr);

    const lookup = await lookupSpaceByAPI(target, apiEndpoint, visitorAuthToken);
    if (!lookup) {
        return null;
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
    };
}

/**
 * Lookup a space by its URL using the GitBook API.
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 */
async function lookupSpaceByAPI(
    url: URL,
    apiEndpoint: string | undefined,
    visitorAuthToken: string | undefined,
): Promise<PublishedContentLookup | null> {
    const lookupAlternatives = computeLookupAlternatives(url);

    console.log(
        `lookup content for url "${url.toString()}", with ${
            lookupAlternatives.length
        } alternatives`,
    );

    console.time('lookupSpaceByAPI');
    try {
        const abort = new AbortController();
        const matches = await Promise.all(
            lookupAlternatives.map(async (alternative) => {
                try {
                    const data = await getPublishedContentByUrl(
                        alternative.url,
                        apiEndpoint,
                        visitorAuthToken,
                        {
                            signal: abort.signal,
                        },
                    );

                    if ('redirect' in data) {
                        if (alternative.url === url.toString()) {
                            return data;
                        }

                        return null;
                    }

                    // Cancel all other requests to speed up the lookup
                    abort.abort();
                    return {
                        space: data.space,
                        basePath: data.basePath,
                        pathname: joinPath(data.pathname, alternative.extraPath),
                        apiToken: data.apiToken,
                    } as PublishedContentLookup;
                } catch (error) {
                    // @ts-ignore
                    if (error.name === 'AbortError') {
                        return null;
                    }

                    throw error;
                }
            }),
        );
        return matches.find((match) => match !== null) ?? null;
    } finally {
        console.timeEnd('lookupSpaceByAPI');
    }
}

function computeLookupAlternatives(url: URL) {
    const alternatives: Array<{ url: string; extraPath: string }> = [];

    // Match only with the host, if it can be a custom hostname
    // It should cover most cases of custom domains, and with caching, it should be fast.
    if (!url.hostname.includes('.gitbook.io')) {
        alternatives.push({
            url: url.origin,
            extraPath: url.pathname,
        });
    }

    const pathSegments = url.pathname.slice(1).split('/');

    // Match with only the first segment of the path
    // as it could potentially a space in an organization or collection domain
    // or a space using a share link secret
    if (pathSegments.length > 0) {
        const shortURL = new URL(url);
        shortURL.pathname = pathSegments[0];
        alternatives.push({
            url: shortURL.toString(),
            extraPath: pathSegments.slice(1).join('/'),
        });
    }

    // URL looks like a collection url (with /v/ in the path)
    if (pathSegments.includes('v')) {
        const collectionURL = new URL(url);
        const vIndex = pathSegments.indexOf('v');
        collectionURL.pathname = pathSegments.slice(0, vIndex + 1).join('/');
        alternatives.push({
            url: collectionURL.toString(),
            extraPath: pathSegments.slice(vIndex + 1).join('/'),
        });
    }

    // Always try with the full URL
    if (!alternatives.some((alt) => alt.url === url.toString())) {
        alternatives.push({
            url: url.toString(),
            extraPath: '',
        });
    }

    return alternatives;
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

function stripURLSearch(url: URL): URL {
    const stripped = new URL(url.toString());
    stripped.search = '';
    return stripped;
}
