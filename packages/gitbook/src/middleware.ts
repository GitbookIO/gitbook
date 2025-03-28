import { type ContentAPITokenPayload, CustomizationThemeMode, GitBookAPI } from '@gitbook/api';
import { getURLLookupAlternatives, normalizeURL } from '@v2/lib/data';
import assertNever from 'assert-never';
import jwt from 'jsonwebtoken';
import { type NextRequest, NextResponse } from 'next/server';
import hash from 'object-hash';

import {
    DEFAULT_API_ENDPOINT,
    type PublishedContentWithCache,
    api,
    getPublishedContentByUrl,
    getPublishedContentSite,
    getSpace,
    userAgent,
    withAPI,
} from '@/lib/api';
import { race } from '@/lib/async';
import { buildVersion } from '@/lib/build';
import { getContentSecurityPolicy } from '@/lib/csp';
import { validateSerializedCustomization } from '@/lib/customization';
import { setMiddlewareHeader } from '@/lib/middleware';
import {
    type ResponseCookies,
    type VisitorTokenLookup,
    getResponseCookiesForVisitorAuth,
    getVisitorToken,
    normalizeVisitorAuthURL,
} from '@/lib/visitor-token';

import { joinPath, withLeadingSlash } from '@/lib/paths';
import { getProxyModeBasePath } from '@/lib/proxy';
import { MiddlewareHeaders } from '@v2/lib/middleware';
import { addResponseCacheTag } from './lib/cache/response';

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

export type LookupResult = PublishedContentWithCache & {
    /** API endpoint to use for the content post lookup */
    apiEndpoint?: string;
    /** Cookies to store on the response */
    cookies?: ResponseCookies;
    /** Visitor authentication token */
    visitorToken?: string;
    /** URL of the site */
    siteURL?: string;
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
    const isServerAction = request.headers.has('Next-Action');

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
        () => lookupSiteForURL(mode, request, inputURL)
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
        return writeCookies(NextResponse.redirect(resolved.redirect), resolved.cookies);
    }

    // Make sure the URL is clean of any va token after a successful lookup
    // The token is stored in a cookie that is set on the redirect response
    const normalizedVA = normalizeVisitorAuthURL(normalized);
    if (normalizedVA.toString() !== normalized.toString()) {
        return writeCookies(NextResponse.redirect(normalizedVA.toString()), resolved.cookies);
    }

    // Because of how Next will encode, we need to encode ourselves the pathname before rewriting to it.
    const rewritePathname = withLeadingSlash(encodePathname(resolved.pathname));

    // Resolution might have changed the API endpoint
    apiEndpoint = resolved.apiEndpoint ?? apiEndpoint;

    const contextId = 'site' in resolved ? resolved.contextId : undefined;
    const csp = getContentSecurityPolicy();

    const headers = new Headers(request.headers);
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
        mode === 'proxy'
            ? getProxyModeBasePath(inputURL, resolved)
            : joinPath(originBasePath, resolved.basePath)
    );
    headers.set('x-gitbook-site-basepath', joinPath(originBasePath, resolved.siteBasePath));
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

        // For server actions that use v2 code
        headers.set(MiddlewareHeaders.SiteURLData, JSON.stringify(resolved));
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
    if (customization && validateSerializedCustomization(customization)) {
        headers.set(MiddlewareHeaders.Customization, customization);
    }

    const theme = url.searchParams.get('theme');
    if (theme === CustomizationThemeMode.Dark || theme === CustomizationThemeMode.Light) {
        headers.set(MiddlewareHeaders.Theme, theme);
    }

    if (apiEndpoint) {
        headers.set('x-gitbook-api', apiEndpoint);
    }

    const target = new URL(joinPath('/middleware', rewritePathname), request.nextUrl.toString());
    target.search = url.search;

    const response = writeCookies(
        NextResponse.rewrite(target, {
            request: {
                headers,
            },
        }),
        // A long-standing bug in Nextjs causes modifying cookies in Server Actions to refresh the page and cause root rerenders.
        // https://github.com/vercel/next.js/issues/50163
        // We don't set the cookies if we're in a server action.
        isServerAction ? undefined : resolved.cookies
    );

    // Add method so Cloudflare can use it for caching
    setMiddlewareHeader(response, 'x-http-method', request.method);

    setMiddlewareHeader(response, 'x-gitbook-version', buildVersion());

    // Add Content Security Policy header
    setMiddlewareHeader(response, 'content-security-policy', csp);
    // Basic security headers
    setMiddlewareHeader(response, 'strict-transport-security', 'max-age=31536000');
    setMiddlewareHeader(response, 'referrer-policy', 'no-referrer-when-downgrade');
    setMiddlewareHeader(response, 'x-content-type-options', 'nosniff');

    const cacheControl = (() => {
        // For Server Actions, we don't want to cache the response on the server.
        // We don't want to store responses either.
        if (isServerAction) {
            return 'no-cache, no-store';
        }

        // When the request is authenticated, we don't want to cache the response on the server.
        // Allow storing so that revalidation still happens with server.
        if (resolved.visitorToken) {
            return 'no-cache, no-store';
        }

        if (typeof resolved.cacheMaxAge === 'number') {
            return `public, max-age=0, s-maxage=${resolved.cacheMaxAge}, stale-if-error=0`;
        }
    })();

    if (cacheControl) {
        if (process.env.GITBOOK_OUTPUT_CACHE === 'true' && process.env.NODE_ENV !== 'development') {
            setMiddlewareHeader(response, 'cache-control', cacheControl);
            setMiddlewareHeader(response, 'Cloudflare-CDN-Cache-Control', cacheControl);
        } else {
            setMiddlewareHeader(response, 'x-gitbook-cache-control', cacheControl);
        }
    }

    if (resolved.cacheTags) {
        addResponseCacheTag(...resolved.cacheTags);
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
        return {
            mode: 'proxy',
            url: new URL(xGitbookSite),
        };
    }

    return { url, mode };
}

async function lookupSiteForURL(
    mode: URLLookupMode,
    request: NextRequest,
    url: URL
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
            'Missing GITBOOK_SPACE_ID environment variable. It should be passed when using GITBOOK_MODE=single.'
        );
    }

    const apiCtx = await api();
    const apiToken = getDefaultAPIToken(apiCtx.client.endpoint);
    if (!apiToken) {
        throw new Error(
            'Missing GITBOOK_TOKEN environment variable. It should be passed when using GITBOOK_MODE=single.'
        );
    }

    return {
        kind: 'space',
        space: spaceId,
        basePath: '',
        siteBasePath: '',
        pathname: url.pathname,
        apiToken,
        visitorToken: undefined,
    };
}

/**
 * GITBOOK_MODE=proxy
 * When proxying a site on a different base URL.
 */
async function lookupSiteInProxy(request: NextRequest, url: URL): Promise<LookupResult> {
    return await lookupSiteInMultiMode(request, url);
}

/**
 * GITBOOK_MODE=multi
 * When serving multi spaces based on the current URL.
 */
async function lookupSiteInMultiMode(request: NextRequest, url: URL): Promise<LookupResult> {
    const visitorAuthToken = getVisitorToken({
        cookies: request.cookies.getAll(),
        url,
    });
    const lookup = await lookupSiteByAPI(url, visitorAuthToken);
    return {
        ...lookup,
        ...('basePath' in lookup && visitorAuthToken
            ? getLookupResultForVisitorAuth(lookup.basePath, visitorAuthToken)
            : {}),
        visitorToken: visitorAuthToken?.token,
    };
}

/**
 * GITBOOK_MODE=multi-id
 * When serving multi spaces with the ID passed in the path.
 *
 * The format of the path is:
 *   - /~space|~site/:id/:path
 *   - /~space|~site/:id/~/changes/:changeId/:path
 *   - /~space|~site/:id/~/revisions/:revisionId/:path
 */
async function lookupSiteOrSpaceInMultiIdMode(
    request: NextRequest,
    url: URL
): Promise<LookupResult> {
    const basePathParts: string[] = [];
    const pathSegments = url.pathname.slice(1).split('/');

    const eatPathId = (...prefixes: string[]): string | undefined => {
        const match = prefixes.every((prefix, index) => pathSegments[index] === prefix);
        if (!match || pathSegments.length < prefixes.length + 1) {
            return;
        }

        // Remove the prefix from the path segments
        pathSegments.splice(0, prefixes.length);

        // Add the prefix to the base path
        basePathParts.push(...prefixes);

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
                message: 'Missing site or space ID in the path',
            },
        };
    }

    // Extract the change request or revision ID from the path
    const changeRequestId = eatPathId('~', 'changes');
    const revisionId = eatPathId('~', 'revisions');

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
                message: 'Missing token query parameter',
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
    const apiCtx = await api();
    const gitbookAPI = new GitBookAPI({
        endpoint: apiEndpoint ?? apiCtx.client.endpoint,
        authToken: apiToken,
        userAgent: userAgent(),
    });

    // Verify access to the space to avoid leaking cached data in this mode
    // (the cache is not dependend on the auth token, so it could leak data)
    if (source.kind === 'space') {
        await withAPI({ client: gitbookAPI, contextId }, () =>
            getSpace.revalidate(source.id, undefined)
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
            })
        );
    }

    const cookies: ResponseCookies = [
        {
            name: cookieName,
            value: encodeGitBookTokenCookie(source.id, apiToken, apiEndpoint),
            options: {
                httpOnly: true,
                maxAge: 60 * 30,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
            },
        },
    ];

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

    const basePath = withLeadingSlash(basePathParts.join('/'));
    return {
        // In multi-id mode, complete is always considered true because there is no URL to resolve
        ...(decoded.kind === 'site' ? { ...decoded, complete: true } : decoded),
        changeRequest: changeRequestId,
        revision: revisionId,
        siteBasePath: basePath,
        basePath,
        pathname: withLeadingSlash(pathSegments.join('/')),
        apiToken,
        apiEndpoint,
        contextId,
        cookies,
        canonicalUrl: url.toString(),
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
                message: 'favicon.ico, robots.txt, sitemap.xml should be accessed under a content',
            },
        };
    }
    // Only match something that starts with a domain like
    if (!url.pathname.match(/^.+\..+/)) {
        return {
            error: {
                code: 404,
                message: 'Invalid URL in the path, should start with a domain',
            },
        };
    }

    const targetStr = `https://${url.pathname}`;

    if (!URL.canParse(targetStr)) {
        return {
            error: {
                code: 404,
                message: 'Invalid URL in the path',
            },
        };
    }
    const target = new URL(targetStr);
    target.search = url.search;

    const visitorAuthToken = getVisitorToken({
        cookies: request.cookies.getAll(),
        url: target,
    });

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
                    `/${redirect.hostname}${redirect.pathname}${redirect.search}`,
                    url
                ).toString(),
            };
        }

        return lookup;
    }

    return {
        ...lookup,
        siteBasePath: joinPath(target.host, lookup.siteBasePath),
        basePath: joinPath(target.host, lookup.basePath),
        ...('basePath' in lookup && visitorAuthToken
            ? getLookupResultForVisitorAuth(lookup.basePath, visitorAuthToken)
            : {}),
        visitorToken: visitorAuthToken?.token,
    };
}

/**
 * Lookup a space by its URL using the GitBook API.
 * To optimize caching, we try multiple lookup alternatives and return the first one that matches.
 */
async function lookupSiteByAPI(
    lookupURL: URL,
    visitorTokenLookup: VisitorTokenLookup
): Promise<LookupResult> {
    const url = stripURLSearch(lookupURL);
    const lookup = getURLLookupAlternatives(url);

    // When the visitor auth token is pulled from the cookie, set redirectOnError when calling getPublishedContentByUrl to allow
    // redirecting when the token is invalid as we could be dealing with stale token stored in the cookie.
    // For example when the VA backend signature has changed but the token stored in the cookie is not yet expired.
    const redirectOnError = visitorTokenLookup?.source === 'visitor-auth-cookie';

    const result = await race(lookup.urls, async (alternative, { signal }) => {
        const data = await getPublishedContentByUrl(
            alternative.url,
            visitorTokenLookup?.token,
            redirectOnError || undefined,
            {
                signal,
            }
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
                                    alternative.extraPath
                                )
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
                siteBasePath: data.siteBasePath,
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

    if (result) {
        if ('site' in result) {
            return {
                ...result,
                siteURL: `${lookupURL.origin}${result.basePath}`,
            };
        }

        return result;
    }

    return {
        error: {
            code: 404,
            message: 'No content found',
        },
    };
}

/**
 * Return the lookup result for content served with visitor auth. It basically disables caching
 * and sets a cookie with the visitor auth token.
 */
function getLookupResultForVisitorAuth(
    basePath: string,
    visitorTokenLookup: VisitorTokenLookup
): Partial<LookupResult> {
    return {
        // No caching for content served with visitor auth
        cacheMaxAge: undefined,
        cacheTags: [],
        cookies: getResponseCookiesForVisitorAuth(basePath, visitorTokenLookup),
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

function stripBasePath(pathname: string, basePath: string): string {
    if (basePath === '') {
        return pathname;
    }

    if (!pathname.startsWith(basePath)) {
        throw new Error(`Invalid pathname ${pathname} for basePath ${basePath}`);
    }

    pathname = pathname.slice(basePath.length);
    if (!pathname.startsWith('/')) {
        pathname = `/${pathname}`;
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

function encodePathname(pathname: string): string {
    return pathname.split('/').map(encodeURIComponent).join('/');
}

function decodeGitBookTokenCookie(
    sourceId: string,
    cookie: string | undefined
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
    } catch (_error) {
        // ignore
    }
}

function encodeGitBookTokenCookie(
    spaceId: string,
    token: string,
    apiEndpoint: string | undefined
): string {
    return JSON.stringify({ s: spaceId, t: token, e: apiEndpoint });
}

function writeCookies<R extends NextResponse>(response: R, cookies: ResponseCookies = []): R {
    cookies.forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
    });

    return response;
}
