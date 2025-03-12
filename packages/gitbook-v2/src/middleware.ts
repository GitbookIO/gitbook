import { CustomizationThemeMode } from '@gitbook/api';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getContentSecurityPolicy } from '@/lib/csp';
import { validateSerializedCustomization } from '@/lib/customization';
import { removeLeadingSlash, removeTrailingSlash } from '@/lib/paths';
import {
    type ResponseCookies,
    getPathScopedCookieName,
    getResponseCookiesForVisitorAuth,
    getVisitorToken,
    normalizeVisitorAuthURL,
} from '@/lib/visitor-token';
import { serveResizedImage } from '@/routes/image';
import { getLinkerForSiteURL } from '@v2/lib/context';
import {
    DataFetcherError,
    getPublishedContentByURL,
    normalizeURL,
    throwIfDataError,
} from '@v2/lib/data';
import { isGitBookAssetsHostURL, isGitBookHostURL } from '@v2/lib/env';
import { MiddlewareHeaders } from '@v2/lib/middleware';

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|~gitbook/static|~gitbook/revalidate|~gitbook/monitoring|~scalar/proxy).*)',
    ],
};

type URLWithMode = { url: URL; mode: 'url' | 'url-host' };

export async function middleware(request: NextRequest) {
    try {
        const requestURL = new URL(request.url);

        // Redirect to normalize the URL
        const normalized = normalizeURL(requestURL);
        if (normalized.toString() !== requestURL.toString()) {
            return NextResponse.redirect(normalized.toString());
        }

        for (const handler of [serveSiteRoutes, servePreviewRoutes]) {
            const result = await handler(requestURL, request);
            if (result) {
                return result;
            }
        }

        return NextResponse.next();
    } catch (error) {
        return serveErrorResponse(error as Error);
    }
}

/**
 * Handle request that are targetting the site routes group.
 */
async function serveSiteRoutes(requestURL: URL, request: NextRequest) {
    const match = getSiteURLFromRequest(request);
    if (!match) {
        return null;
    }

    const { url: siteURL, mode } = match;

    /**
     * Serve image resizing requests (all requests containing `/~gitbook/image`).
     * All URLs containing `/~gitbook/image` are rewritten to `/~gitbook/image`
     * and serve from a single route handler.
     *
     * In GitBook v1: image resizing was done at the root of the hostname (docs.company.com/~gitbook/image)
     * In GitBook v2: image resizing is done at the content level (docs.company.com/section/variant/~gitbook/image)
     */
    if (siteURL.pathname.endsWith('/~gitbook/image')) {
        return await serveResizedImage(request, {
            host: siteURL.host,
        });
    }

    //
    // Detect and extract the visitor authentication token from the request
    //
    // @ts-ignore - request typing
    const visitorToken = getVisitorToken(request, siteURL);

    const data = await throwIfDataError(
        getPublishedContentByURL({
            url: siteURL.toString(),
            visitorAuthToken: visitorToken?.token ?? null,
            // When the visitor auth token is pulled from the cookie, set redirectOnError when calling getPublishedContentByUrl to allow
            // redirecting when the token is invalid as we could be dealing with stale token stored in the cookie.
            // For example when the VA backend signature has changed but the token stored in the cookie is not yet expired.
            redirectOnError: visitorToken?.source === 'visitor-auth-cookie',
        })
    );
    let cookies: ResponseCookies = {};

    //
    // Handle redirects
    //
    if ('redirect' in data) {
        // biome-ignore lint/suspicious/noConsole: we want to log the redirect
        console.log('redirect', data.redirect);
        if (data.target === 'content') {
            // For content redirects, we use the linker to redirect the optimal URL
            // during development and testing in 'url' mode.
            const linker = getLinkerForSiteURL({
                siteURL,
                urlMode: mode,
            });

            const contentRedirect = new URL(linker.toLinkForContent(data.redirect), request.url);

            // Keep the same search params as the original request
            // as it might contain a VA token
            contentRedirect.search = request.nextUrl.search;

            return NextResponse.redirect(contentRedirect);
        }

        return NextResponse.redirect(data.redirect);
    }

    cookies = {
        ...cookies,
        ...getResponseCookiesForVisitorAuth(data.basePath, visitorToken),
    };

    //
    // Make sure the URL is clean of any va token after a successful lookup
    // The token is stored in a cookie that is set on the redirect response
    //
    const requestURLWithoutToken = normalizeVisitorAuthURL(requestURL);
    if (requestURLWithoutToken.toString() !== requestURL.toString()) {
        return writeResponseCookies(
            NextResponse.redirect(requestURLWithoutToken.toString()),
            cookies
        );
    }

    //
    // Render and serve the content
    //

    // When visitor has authentication (adaptive content or VA), we serve dynamic routes.
    let routeType = visitorToken ? 'dynamic' : 'static';

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(MiddlewareHeaders.RouteType, routeType);
    requestHeaders.set(MiddlewareHeaders.URLMode, mode);
    requestHeaders.set(MiddlewareHeaders.SiteURL, `${siteURL.origin}${data.basePath}`);
    requestHeaders.set(MiddlewareHeaders.SiteURLData, JSON.stringify(data));

    // Preview of customization/theme
    const customization = siteURL.searchParams.get('customization');
    if (customization && validateSerializedCustomization(customization)) {
        routeType = 'dynamic';
        requestHeaders.set(MiddlewareHeaders.Customization, customization);
    }
    const theme = siteURL.searchParams.get('theme');
    if (theme === CustomizationThemeMode.Dark || theme === CustomizationThemeMode.Light) {
        routeType = 'dynamic';
        requestHeaders.set(MiddlewareHeaders.Theme, theme);
    }

    // We support forcing dynamic routes by setting a `gitbook-dynamic-route` cookie
    // This is useful for testing dynamic routes.
    if (request.cookies.has('gitbook-dynamic-route')) {
        routeType = 'dynamic';
    }

    // Pass a x-forwarded-host and origin that are equal to ensure Next doesn't block server actions when proxied
    requestHeaders.set('x-forwarded-host', request.nextUrl.host);
    requestHeaders.set('origin', request.nextUrl.origin);

    const siteURLWithoutProtocol = `${siteURL.host}${data.basePath}`;
    const { pathname, routeType: routeTypeFromPathname } = encodePathInSiteContent(data.pathname);
    routeType = routeTypeFromPathname ?? routeType;

    const route = [
        'sites',
        routeType,
        mode,
        encodeURIComponent(siteURLWithoutProtocol),
        pathname,
    ].join('/');

    console.log(`rewriting ${request.nextUrl.toString()} to ${route}`);

    const rewrittenURL = new URL(`/${route}`, request.nextUrl.toString());
    const response = NextResponse.rewrite(rewrittenURL, {
        request: {
            headers: requestHeaders,
        },
    });

    // Add Content Security Policy header
    response.headers.set('content-security-policy', getContentSecurityPolicy());
    // Basic security headers
    response.headers.set('strict-transport-security', 'max-age=31536000');
    response.headers.set('referrer-policy', 'no-referrer-when-downgrade');
    response.headers.set('x-content-type-options', 'nosniff');
    // Debug header
    response.headers.set('x-gitbook-route-type', routeType);
    response.headers.set('x-gitbook-route-site', siteURLWithoutProtocol);

    return writeResponseCookies(response, cookies);
}

/**
 * Serve routes for previewing unpublished content.
 * Routes are:
 *   - PDF export for a space: /~space/:spaceId/~gitbook/pdf
 *   - Preview of an unpublished site: /~site/:siteId/
 */
async function servePreviewRoutes(requestURL: URL, request: NextRequest) {
    const pathnameParts = requestURL.pathname.slice(1).split('/');

    if (pathnameParts[0] !== '~space' && pathnameParts[0] !== '~site') {
        return null;
    }

    // We store the API token in a cookie that is scoped to the specific preview route
    // to avoid errors when multiple previews are opened in different tabs.
    const cookieName = getPathScopedCookieName(
        'gitbook-api-token',
        pathnameParts.slice(0, 2).join('/')
    );

    // Extract a potential GitBook API token passed in the request
    // If found, we redirect to the same URL but with the token in the cookie
    const queryAPIToken = requestURL.searchParams.get('token');
    if (queryAPIToken) {
        requestURL.searchParams.delete('token');
        return writeResponseCookies(NextResponse.redirect(requestURL.toString()), {
            [cookieName]: {
                value: queryAPIToken,
                options: {
                    httpOnly: true,
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60, // 1 hour
                },
            },
        });
    }

    const apiToken = request.cookies.get(cookieName)?.value;
    if (!apiToken) {
        throw new DataFetcherError('Missing API token', 400);
    }

    // Handle the rest with the router default logic
    return NextResponse.next({
        headers: {
            [MiddlewareHeaders.APIToken]: apiToken,
        },
    });
}

/**
 * Serve an error response.
 */
function serveErrorResponse(error: Error) {
    if (error instanceof DataFetcherError) {
        return new Response(error.message, {
            status: error.code,
            headers: { 'content-type': 'text/plain' },
        });
    }

    throw error;
}

/**
 * The URL of the GitBook content can be passed in 3 different ways (in order of priority):
 * - The request has a `X-GitBook-URL` header:
 *      URL is taken from the header.
 * - The request has a `X-Forwarded-Host` header:
 *      Host is taken from the header, pathname is taken from the request URL.
 * - The request URL is matching `/url/:url`:
 *      URL is taken from the pathname.
 */
function getSiteURLFromRequest(request: NextRequest): URLWithMode | null {
    const xGitbookUrl = request.headers.get('x-gitbook-url');
    if (xGitbookUrl) {
        return {
            url: appendQueryParams(new URL(xGitbookUrl), request.nextUrl.searchParams),
            mode: 'url-host',
        };
    }

    const isMainHost = isGitBookHostURL(request.url);
    const isAssetsHost = isGitBookAssetsHostURL(request.url);

    // /url/:url requests on the main host
    const prefix = '/url/';
    if (isMainHost && request.nextUrl.pathname.startsWith(prefix)) {
        return {
            url: appendQueryParams(
                new URL(`https://${request.nextUrl.pathname.slice(prefix.length)}`),
                request.nextUrl.searchParams
            ),
            mode: 'url',
        };
    }

    // Skip other requests to main hosts
    if (isMainHost || isAssetsHost) {
        return null;
    }

    const xForwardedHost = request.headers.get('x-forwarded-host');
    // The x-forwarded-host is set by Vercel for all requests
    // so we ignore it if the hostname is the same as the instance one.
    if (xForwardedHost) {
        return {
            url: appendQueryParams(
                new URL(`https://${xForwardedHost}${request.nextUrl.pathname}`),
                request.nextUrl.searchParams
            ),
            mode: 'url-host',
        };
    }

    return null;
}

/**
 * Encode path in a site content.
 * Special paths are not encoded and passed to be handled by the route handlers.
 */
function encodePathInSiteContent(rawPathname: string): {
    pathname: string;
    routeType?: 'static' | 'dynamic';
} {
    const pathname = removeLeadingSlash(removeTrailingSlash(rawPathname));

    if (pathname.match(/^~gitbook\/ogimage\/\S+$/)) {
        return { pathname };
    }

    switch (pathname) {
        case '~gitbook/icon':
        case 'llms.txt':
        case 'sitemap.xml':
        case 'robots.txt':
            return { pathname };
        case '~gitbook/pdf':
            // PDF routes are always dynamic as they depend on the search params.
            return { pathname, routeType: 'dynamic' };
        default:
            return { pathname: encodeURIComponent(pathname || '/') };
    }
}

/**
 * Append all the query params from a URL to another URL.
 */
function appendQueryParams(url: URL, from: URLSearchParams) {
    for (const [key, value] of from.entries()) {
        url.searchParams.set(key, value);
    }

    return url;
}

/**
 * Write the cookies to a response.
 */
function writeResponseCookies<R extends NextResponse>(response: R, cookies: ResponseCookies): R {
    Object.entries(cookies).forEach(([key, { value, options }]) => {
        response.cookies.set(key, value, options);
    });

    return response;
}
