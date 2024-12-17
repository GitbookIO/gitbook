import { ContentAPITokenPayload, GitBookAPI } from '@gitbook/api';
import { setTag, setContext } from '@sentry/nextjs';
import assertNever from 'assert-never';
import jwt from 'jsonwebtoken';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { NextResponse, NextRequest } from 'next/server';
import hash from 'object-hash';

import {
    PublishedContentWithCache,
    getPublishedContentByUrl,
    api,
    getSpace,
    getSpaceContentData,
    userAgent,
    withAPI,
    DEFAULT_API_ENDPOINT,
    getPublishedContentSite,
    getSiteData,
} from '@/lib/api';
import { race } from '@/lib/async';
import { buildVersion } from '@/lib/build';
import { createContentSecurityPolicyNonce, getContentSecurityPolicy } from '@/lib/csp';
import { getURLLookupAlternatives, normalizeURL, setMiddlewareHeader } from '@/lib/middleware';
import {
    VisitorAuthCookieValue,
    getVisitorAuthCookieName,
    getVisitorAuthCookieValue,
    getVisitorAuthToken,
    normalizeVisitorAuthURL,
} from '@/lib/visitor-auth';

import { waitUntil } from './lib/waitUntil';

export const config = {
    matcher:
        '/((?!_next/static|_next/image|~gitbook/revalidate|~gitbook/image|~gitbook/monitoring|~gitbook/static|~scalar/proxy).*)',
    skipTrailingSlashRedirect: true,
};

type URLLookupMode =
    /**
     * Only a single space is served on this instance, defined by the env GITBOOK_SPACE_ID.
     * This mode is useful when self-hosting a single space.
     */
    | 'single'
    /**
     * Mode when a site is being proxied on a different base URL.
     * - x-gitbook-site-url is used to determine the site to serve.
     * - host / x-forwarded-host / x-gitbook-host + x-gitbook-basepath is used to determine the base URL.
     */
    | 'proxy'
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
     * Sites or Spaces are located using an ID stored in the first segments of the URL (open.gitbook.com/~site|~space/:id/)
     * This mode is automatically detected and doesn't need to be configured.
     * When this mode is used, an authentication token should be passed as a query parameter (`token`).
     */
    | 'multi-id';

export type LookupCookies = Record<
    string,
    {
        value: string;
        options?: Partial<ResponseCookie>;
    }
>;

export type LookupResult = PublishedContentWithCache & {
    /** API endpoint to use for the content post lookup */
    apiEndpoint?: string;
    /** Cookies to store on the response */
    cookies?: LookupCookies;
};

/**
 * Middleware to lookup the site to render.
 * It takes as input a request with an URL, and a set of headers:
 *   - x-gitbook-api: the API endpoint to use, if undefined, the default one is used
 *   - x-gitbook-basepath: base in the path that should be ignored for routing
 *
 * Once the site has been looked-up, the middleware passes the info to the rendering
 * using a rewrite with a set of headers. This is the only way in next.js to do this (basically similar to AsyncLocalStorage).
 *
 * The middleware also takes care of persisting the visitor authentication state.
 */
export async function middleware(request: NextRequest) {
    const { url, mode } = getInputURL(request);

    setTag('url', url.toString());
    setContext('request', {
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
    let apiEndpoint = request.headers.get('x-gitbook-api') ?? DEFAULT_API_ENDPOINT;
    const originBasePath = request.headers.get('x-gitbook-basepath') ?? '';

    const inputURL = mode === 'proxy' ? url : stripURLBasePath(url, originBasePath);

    const resolved = await withAPI(
        {
            client: new GitBookAPI({
                endpoint: apiEndpoint,
                authToken: getDefaultAPIToken(apiEndpoint),
                userAgent: userAgent(),
            }),
            contextId: undefined,
        },
        () => lookupSiteForURL(mode, request, inputURL),
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

    setTag('space', resolved.space);
    setContext('content', {
        space: resolved.space,
        changeRequest: resolved.changeRequest,
        revision: resolved.revision,
        ...('site' in resolved ? { site: resolved.site, siteSpace: resolved.siteSpace } : {}),
    });

    // Because of how Next will encode, we need to encode ourselves the pathname before rewriting to it.
    const rewritePathname = normalizePathname(encodePathname(resolved.pathname));

    console.log(`${request.method} (${resolved.space}) ${rewritePathname}`);

    // Resolution might have changed the API endpoint
    apiEndpoint = resolved.apiEndpoint ?? apiEndpoint;

    const contextId = 'site' in resolved ? resolved.contextId : undefined;
    const nonce = createContentSecurityPolicyNonce();
    const csp = await withAPI(
        {
            client: new GitBookAPI({
                endpoint: apiEndpoint,
                authToken: resolved.apiToken,
                userAgent: userAgent(),
            }),
            contextId,
        },
        async () => {
            const [siteData] = await Promise.all([
                'site' in resolved
                    ? getSiteData({
                          organizationId: resolved.organization,
                          siteId: resolved.site,
                          siteSectionId: resolved.siteSection,
                          siteSpaceId: resolved.siteSpace,
                          siteShareKey: resolved.shareKey,
                      })
                    : null,
                // Start fetching everything as soon as possible, but do not block the middleware on it
                // the cache will handle concurrent calls
                waitUntil(
                    getSpaceContentData(
                        {
                            spaceId: resolved.space,
                            changeRequestId: resolved.changeRequest,
                            revisionId: resolved.revision,
                        },
                        'site' in resolved ? resolved.shareKey : undefined,
                    ),
                ),
            ]);

            const scripts = siteData?.scripts ?? [];
            return getContentSecurityPolicy(scripts, nonce);
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
    if (contextId) {
        headers.set('x-gitbook-token-context', contextId);
    }
    headers.set('x-gitbook-mode', mode);
    headers.set('x-gitbook-origin-basepath', originBasePath);
    headers.set(
        'x-gitbook-basepath',
        mode === 'proxy' ? originBasePath : joinPath(originBasePath, resolved.basePath),
    );
    headers.set('x-gitbook-content-space', resolved.space);
    if ('site' in resolved) {
        headers.set('x-gitbook-content-organization', resolved.organization);
        headers.set('x-gitbook-content-site', resolved.site);
        if (resolved.siteSection) {
            headers.set('x-gitbook-content-site-section', resolved.siteSection);
        }
        if (resolved.siteSpace) {
            headers.set('x-gitbook-content-site-space', resolved.siteSpace);
        }
        if (resolved.shareKey) {
            headers.set('x-gitbook-content-site-share-key', resolved.shareKey);
        }
    }

    // For tests, we make it possible to enable search indexation
    // using a query parameter.
    const xGitBookSearchIndexation =
        headers.get('x-gitbook-search-indexation') ??
        url.searchParams.has('x-gitbook-search-indexation');
    if (xGitBookSearchIndexation) {
        headers.set('x-gitbook-search-indexation', 'true');
    }

    if (resolved.revision) {
        headers.set('x-gitbook-content-revision', resolved.revision);
    }
    if (resolved.changeRequest) {
        headers.set('x-gitbook-content-changerequest', resolved.changeRequest);
    }

    const customization = url.searchParams.get('customization');
    if (customization) {
        headers.set('x-gitbook-customization', customization);
    }

    const theme = url.searchParams.get('theme');
    if (theme) {
        headers.set('x-gitbook-theme', theme);
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

    setMiddlewareHeader(response, 'x-gitbook-version', buildVersion());

    // Add Content Security Policy header
    setMiddlewareHeader(response, 'content-security-policy', csp);
    // Basic security headers
    setMiddlewareHeader(response, 'strict-transport-security', 'max-age=31536000');
    setMiddlewareHeader(response, 'referrer-policy', 'no-referrer-when-downgrade');
    setMiddlewareHeader(response, 'x-content-type-options', 'nosniff');

    if (typeof resolved.cacheMaxAge === 'number') {
        const cacheControl = `public, max-age=0, s-maxage=${resolved.cacheMaxAge}, stale-if-error=0`;

        if (process.env.GITBOOK_OUTPUT_CACHE === 'true' && process.env.NODE_ENV !== 'development') {
            setMiddlewareHeader(response, 'cache-control', cacheControl);
            setMiddlewareHeader(response, 'Cloudflare-CDN-Cache-Control', cacheControl);
        } else {
            setMiddlewareHeader(response, 'x-gitbook-cache-control', cacheControl);
        }
    }
    // }

    if (resolved.cacheTags && resolved.cacheTags.length > 0) {
        const headerCacheTag = resolved.cacheTags.join(',');
        setMiddlewareHeader(response, 'cache-tag', headerCacheTag);
        setMiddlewareHeader(response, 'x-gitbook-cache-tag', headerCacheTag);
    }

    return response;
}

/**
 * Compute the input URL the user is trying to access.
 */
function getInputURL(request: NextRequest): {
    url: URL;
    mode: URLLookupMode;
} {
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

    // When request started with ~space/:id or ~site/:id, we force the mode as 'multi-id'.
    if (url.pathname.startsWith('/~space/') || url.pathname.startsWith('/~site/')) {
        mode = 'multi-id';
    }

    // When passing a x-gitbook-site-url header, this URL is used instead of the request URL
    // to determine the site to serve.
    const xGitbookSite = request.headers.get('x-gitbook-site-url');
    if (xGitbookSite) {
        mode = 'proxy';
    }

    return { url, mode };
}

async function lookupSiteForURL(
    mode: URLLookupMode,
    request: NextRequest,
    url: URL,
): Promise<LookupResult> {
    switch (mode) {
        case 'single': {
            return await lookupSiteInSingleMode(url);
        }
        case 'multi': {
            return await lookupSiteInMultiMode(request, url);
        }
        case 'multi-path': {
            return await lookupSiteInMultiPathMode(request, url);
        }
        case 'multi-id': {
            return await lookupSiteOrSpaceInMultiIdMode(request, url);
        }
        case 'proxy':
            return await lookupSiteInProxy(request, url);
        default:
            assertNever(mode);
    }
}

/**
 * GITBOOK_MODE=single
 * When serving a single space, configured using GITBOOK_SPACE_ID and GITBOOK_TOKEN.
 */
async function lookupSiteInSingleMode(url: URL): Promise<LookupResult> {
    const spaceId = process.env.GITBOOK_SPACE_ID;
    if (!spaceId) {
        throw new Error(
            `Missing GITBOOK_SPACE_ID environment variable. It should be passed when using GITBOOK_MODE=single.`,
        );
    }

    const apiToken = getDefaultAPIToken(api().client.endpoint);
    if (!apiToken) {
        throw new Error(
            `Missing GITBOOK_TOKEN environment variable. It should be passed when using GITBOOK_MODE=single.`,
        );
    }

    return {
        kind: 'space',
        space: spaceId,
        basePath: '',
        pathname: url.pathname,
        apiToken,
    };
}

/**
 * GITBOOK_MODE=proxy
 * When proxying a site on a different base URL.
 */
async function lookupSiteInProxy(request: NextRequest, url: URL): Promise<LookupResult> {
    const rawSiteUrl = request.headers.get('x-gitbook-site-url');
    if (!rawSiteUrl) {
        throw new Error(
            `Missing x-gitbook-site-url header. It should be passed when using GITBOOK_MODE=proxy.`,
        );
    }

    const siteUrl = new URL(rawSiteUrl);
    siteUrl.pathname = joinPath(siteUrl.pathname, url.pathname);

    return await lookupSiteInMultiMode(request, siteUrl);
}

/**
 * GITBOOK_MODE=multi
 * When serving multi spaces based on the current URL.
 */
async function lookupSiteInMultiMode(request: NextRequest, url: URL): Promise<LookupResult> {
    const visitorAuthToken = getVisitorAuthToken(request, url);
    const lookup = await lookupSiteByAPI(url, visitorAuthToken);
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
 *
 * The format of the path is:
 *   - /~space|~site/:id/:path
 *   - /~space|~site/:id/~changes/:changeId/:path
 *   - /~space|~site/:id/~revisions/:revisionId/:path
 */
async function lookupSiteOrSpaceInMultiIdMode(
    request: NextRequest,
    url: URL,
): Promise<LookupResult> {
    const basePathParts: string[] = [];
    const pathSegments = url.pathname.slice(1).split('/');

    const eatPathId = (prefix: string): string | undefined => {
        if (pathSegments[0] !== prefix || pathSegments.length < 2) {
            return;
        }

        const prefixSegment = pathSegments.shift();
        basePathParts.push(prefixSegment!);

        const id = pathSegments.shift();
        basePathParts.push(id!);

        return id;
    };

    const spaceId = eatPathId('~space');
    const siteId = eatPathId('~site');
    const source: { kind: 'space' | 'site'; id: string } | undefined = spaceId
        ? { kind: 'space', id: spaceId }
        : siteId
          ? { kind: 'site', id: siteId }
          : undefined;

    if (!source) {
        return {
            error: {
                code: 400,
                message: `Missing site or space ID in the path`,
            },
        };
    }

    // Extract the change request or revision ID from the path
    const changeRequestId = eatPathId('~changes');
    const revisionId = eatPathId('~revisions');

    // Get the auth token from the URL query
    const AUTH_TOKEN_QUERY = 'token';
    const API_ENDPOINT_QUERY = 'api';
    const cookieName = `gitbook-token-${source.id}`;

    const { apiToken, apiEndpoint } = url.searchParams.has(AUTH_TOKEN_QUERY)
        ? {
              apiToken: url.searchParams.get(AUTH_TOKEN_QUERY) ?? '',
              apiEndpoint: url.searchParams.get(API_ENDPOINT_QUERY) ?? undefined,
          }
        : (decodeGitBookTokenCookie(source.id, request.cookies.get(cookieName)?.value) ?? {
              apiToken: undefined,
              apiEndpoint: undefined,
          });

    if (!apiToken) {
        return {
            error: {
                code: 400,
                message: `Missing token query parameter`,
            },
        };
    }

    const decoded = jwt.decode(apiToken) as ContentAPITokenPayload;
    if (decoded.kind === 'collection') {
        throw new Error('Collection is not supported in multi-id mode');
    }

    // The claims property in the content API token is included when
    // visitor attributes/assertions are passed to the site preview URL.
    //
    // When it's present, we generate a hash using the same method as
    // getPublishedContentByURL to get the context ID so the cache can be
    // invalidated when trying to preview the site with different visitor
    // attributes.
    const contextId = decoded.claims ? hash(decoded.claims) : undefined;
    const gitbookAPI = new GitBookAPI({
        endpoint: apiEndpoint ?? api().client.endpoint,
        authToken: apiToken,
        userAgent: userAgent(),
    });

    // Verify access to the space to avoid leaking cached data in this mode
    // (the cache is not dependend on the auth token, so it could leak data)
    if (source.kind === 'space') {
        await withAPI({ client: gitbookAPI, contextId }, () =>
            getSpace.revalidate(source.id, undefined),
        );
    }

    // Verify access to the site to avoid leaking cached data in this mode
    // (the cache is not dependend on the auth token, so it could leak data)
    if (source.kind === 'site') {
        await withAPI({ client: gitbookAPI, contextId }, () =>
            getPublishedContentSite.revalidate({
                organizationId: decoded.organization,
                siteId: source.id,
                siteShareKey: undefined,
            }),
        );
    }

    const cookies: LookupCookies = {
        [cookieName]: {
            value: encodeGitBookTokenCookie(source.id, apiToken, apiEndpoint),
            options: {
                httpOnly: true,
                maxAge: 60 * 30,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
            },
        },
    };

    // Get rid of the token from the URL
    if (url.searchParams.has(AUTH_TOKEN_QUERY) || url.searchParams.has(API_ENDPOINT_QUERY)) {
        const withoutToken = new URL(url);
        withoutToken.searchParams.delete(AUTH_TOKEN_QUERY);
        withoutToken.searchParams.delete(API_ENDPOINT_QUERY);

        return {
            target: 'external',
            redirect: withoutToken.toString(),
            cookies,
        };
    }

    return {
        // In multi-id mode, complete is always considered true because there is no URL to resolve
        ...(decoded.kind === 'site' ? { ...decoded, complete: true } : decoded),
        changeRequest: changeRequestId,
        revision: revisionId,
        basePath: normalizePathname(basePathParts.join('/')),
        pathname: normalizePathname(pathSegments.join('/')),
        apiToken,
        apiEndpoint,
        cookies,
    };
}

/**
 * GITBOOK_MODE=multi-path
 * When serving multi spaces with the url passed in the path.
 */
async function lookupSiteInMultiPathMode(request: NextRequest, url: URL): Promise<LookupResult> {
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
    target.search = url.search;

    const visitorAuthToken = getVisitorAuthToken(request, target);

    const lookup = await lookupSiteByAPI(target, visitorAuthToken);
    if ('error' in lookup) {
        return lookup;
    }

    if ('redirect' in lookup) {
        if (lookup.target === 'content') {
            // Redirect to the content URL in the same application
            const redirect = new URL(lookup.redirect);
            redirect.search = url.search;

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
async function lookupSiteByAPI(
    lookupURL: URL,
    visitorAuthToken: ReturnType<typeof getVisitorAuthToken>,
): Promise<LookupResult> {
    const url = stripURLSearch(lookupURL);
    const lookup = getURLLookupAlternatives(url);

    console.log(
        `lookup content for url "${url.toString()}", with ${lookup.urls.length} alternatives`,
    );

    const result = await race(lookup.urls, async (alternative, { signal }) => {
        const data = await getPublishedContentByUrl(
            alternative.url,
            typeof visitorAuthToken === 'undefined'
                ? undefined
                : typeof visitorAuthToken === 'string'
                  ? visitorAuthToken
                  : visitorAuthToken.token,
            {
                signal,
            },
        );

        if ('error' in data) {
            if (alternative.primary) {
                // We only return an error for the primary alternative (full URL),
                // as other parts could result in errors due to the URL being incomplete (share links, etc).
                return data;
            }
            return null;
        }

        if ('redirect' in data) {
            if (alternative.primary) {
                // Append the path to the redirect URL
                // because we might have matched a shorter path and the redirect is relative to it
                if (alternative.extraPath) {
                    if (data.target === 'content') {
                        const redirect = new URL(data.redirect);
                        redirect.pathname = joinPath(redirect.pathname, alternative.extraPath);
                        data.redirect = redirect.toString();
                    } else {
                        const redirect = new URL(data.redirect);
                        if (redirect.searchParams.has('location')) {
                            redirect.searchParams.set(
                                'location',
                                joinPath(
                                    redirect.searchParams.get('location') ?? '',
                                    alternative.extraPath,
                                ),
                            );
                            data.redirect = redirect.toString();
                        }
                    }
                }

                return data;
            }

            return null;
        }

        /**
         * We use the following criteria to determine if the lookup result is the right one:
         * - the primary alternative was resolved (because that's the longest or most inclusive path)
         * - the resolution of the site URL is complete (because we want to resolve the deepest path possible)
         *
         * In both cases, the idea is to use the deepest/longest/most inclusive path to resolve the content.
         */
        if (alternative.primary || ('site' in data && data.complete)) {
            const changeRequest = data.changeRequest ?? lookup.changeRequest;
            return {
                space: data.space,
                changeRequest,
                revision: data.revision ?? lookup.revision,
                basePath: joinPath(data.basePath, lookup.basePath ?? ''),
                pathname: joinPath(data.pathname, alternative.extraPath),
                apiToken: data.apiToken,
                // We don't cache change requests as they often change and we want to have consistent previews
                // Purging the CDN cache will not be efficient enough.
                cacheMaxAge: changeRequest ? 0 : data.cacheMaxAge,
                cacheTags: data.cacheTags,
                ...('site' in data
                    ? {
                          site: data.site,
                          siteSection: data.siteSection,
                          siteSpace: data.siteSpace,
                          organization: data.organization,
                          shareKey: data.shareKey,
                          ...(data.contextId ? { contextId: data.contextId } : {}),
                      }
                    : {}),
            } as PublishedContentWithCache;
        }

        return null;
    });

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
    visitorAuthToken: string | VisitorAuthCookieValue,
): Partial<LookupResult> {
    return {
        // No caching for content served with visitor auth
        cacheMaxAge: undefined,
        cacheTags: [],
        cookies: {
            /**
             * If the visitorAuthToken has been retrieved from a cookie, we set it back only
             * if the basePath matches the current one. This is to avoid setting cookie for
             * different base paths.
             */
            ...(typeof visitorAuthToken === 'string' || visitorAuthToken.basePath === basePath
                ? {
                      [getVisitorAuthCookieName(basePath)]: {
                          value: getVisitorAuthCookieValue(
                              basePath,
                              typeof visitorAuthToken === 'string'
                                  ? visitorAuthToken
                                  : visitorAuthToken.token,
                          ),
                          options: {
                              httpOnly: true,
                              sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
                              secure: process.env.NODE_ENV === 'production',
                              maxAge: 7 * 24 * 60 * 60,
                          },
                      },
                  }
                : {}),
        },
    };
}

/**
 * Get the default API token for an API endpoint.
 * The default token is configured globally in the instance using `GITBOOK_TOKEN`,
 * but it's scoped to the default API endpoint.
 */
function getDefaultAPIToken(apiEndpoint: string): string | undefined {
    const defaultToken = process.env.GITBOOK_TOKEN;
    if (!defaultToken) {
        return;
    }

    if (apiEndpoint !== DEFAULT_API_ENDPOINT) {
        // The default token is only used for the default API endpoint
        return;
    }

    return defaultToken;
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

/** Normalize a pathname to make it start with a slash */
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

function decodeGitBookTokenCookie(
    sourceId: string,
    cookie: string | undefined,
): { apiToken: string; apiEndpoint: string | undefined } | undefined {
    if (!cookie) {
        return;
    }

    try {
        const parsed = JSON.parse(cookie);
        if (typeof parsed.t === 'string' && parsed.s === sourceId) {
            return {
                apiToken: parsed.t,
                apiEndpoint: typeof parsed.e === 'string' ? parsed.e : undefined,
            };
        }
    } catch (error) {
        // ignore
    }
}

function encodeGitBookTokenCookie(
    spaceId: string,
    token: string,
    apiEndpoint: string | undefined,
): string {
    return JSON.stringify({ s: spaceId, t: token, e: apiEndpoint });
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
