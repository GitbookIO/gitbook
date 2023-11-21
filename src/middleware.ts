import { GitBookAPI, PublishedContentLookup } from '@gitbook/api';
import { NextResponse, NextRequest } from 'next/server';

export const config = {
    matcher: '/((?!_next/static|_next/image).*)',
};

const VISITOR_AUTH_PARAM = 'jwt_token';
const VISITOR_AUTH_COOKIE = 'gitbook-visitor-token';

/**
 * Middleware to lookup the space to render.
 */
export async function middleware(request: NextRequest) {
    const url = getInputURL(request);

    // The visitor authentication can either be passed as a query parameter
    // or can be stored in a cookie after the initial auth.
    const visitorAuthToken =
        url.searchParams.get(VISITOR_AUTH_PARAM) ?? request.cookies.get(VISITOR_AUTH_COOKIE)?.value;
    url.searchParams.delete(VISITOR_AUTH_PARAM);

    const resolved = await lookupSpaceForURL(stripURLSearch(url), visitorAuthToken);
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
    headers.set('x-gitbook-token', resolved.apiToken);
    headers.set('x-gitbook-basepath', resolved.basePath);

    const target = new URL(`/${resolved.space}${resolved.pathname}`, url.toString());
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
function getInputURL(request: NextRequest) {
    const url = new URL(request.url);

    // When developing locally using something.localhost:3000, the url only contains http://localhost:3000
    if (url.hostname === 'localhost') {
        url.host = request.headers.get('host') ?? url.hostname;
    }

    // When request is proxied, the host is passed in the x-forwarded-host header
    const xForwardedHost = request.headers.get('x-forwarded-host');
    if (xForwardedHost) {
        url.host = xForwardedHost;
    }

    return url;
}

async function lookupSpaceForURL(
    url: URL,
    visitorAuthToken: string | undefined,
): Promise<PublishedContentLookup | null> {
    const mode = process.env.GITBOOK_MODE ?? 'multi-path';

    switch (mode) {
        case 'single': {
            return await lookupSpaceInSingleMode(url);
        }
        case 'multi': {
            return await lookupSpaceInMultiMode(url, visitorAuthToken);
        }
        case 'multi-path': {
            return await lookupSpaceInMultiPathMode(url, visitorAuthToken);
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
    visitorAuthToken: string | undefined,
): Promise<PublishedContentLookup | null> {
    return lookupSpaceByAPI(url, visitorAuthToken);
}

/**
 * GITBOOK_MODE=multi-path
 * When serving multi spaces with the url passed in the path.
 */
async function lookupSpaceInMultiPathMode(
    url: URL,
    visitorAuthToken: string | undefined,
): Promise<PublishedContentLookup | null> {
    const targetStr = `https://${url.pathname}`;

    if (!URL.canParse(targetStr)) {
        throw new Error(`Invalid URL in the path`);
    }
    const target = new URL(targetStr);

    const lookup = await lookupSpaceByAPI(target, visitorAuthToken);
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
    visitorAuthToken: string | undefined,
): Promise<PublishedContentLookup | null> {
    const lookupAlternatives = computeLookupAlternatives(url);

    console.log(
        `lookup content for url "${url.toString()}", with ${
            lookupAlternatives.length
        } alternatives`,
    );

    const gitbook = new GitBookAPI({
        endpoint: process.env.GITBOOK_API_URL,
    });

    return new Promise<PublishedContentLookup>((resolve, reject) => {
        let resolved = false;
        const abort = new AbortController();

        Promise.all(
            lookupAlternatives.map(async (alternative) => {
                const { data } = await gitbook.request<PublishedContentLookup>({
                    method: 'GET',
                    path: '/urls/published',
                    query: {
                        url: alternative.url,
                        visitorAuthToken,
                    },
                    secure: false,
                    format: 'json',
                    signal: abort.signal,
                });

                if (resolved) {
                    return;
                }
                resolved = true;
                abort.abort();

                if (alternative.url === url.toString()) {
                    resolve(data);
                } else if (!('redirect' in data)) {
                    resolve({
                        space: data.space,
                        basePath: data.basePath,
                        pathname: joinPath(data.pathname, alternative.extraPath),
                        apiToken: data.apiToken,
                    });
                }
            }),
        ).catch((error) => {
            if (error.name === 'AbortError') {
                return;
            }

            if (resolved) {
                return;
            }

            resolved = true;
            reject(error);
        });
    });
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

function stripURLSearch(url: URL): URL {
    const stripped = new URL(url.toString());
    stripped.search = '';
    return stripped;
}
