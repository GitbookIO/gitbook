import { CustomizationThemeMode, GitBookAPIError } from '@gitbook/api';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getContentSecurityPolicy } from '@/lib/csp';
import { validateSerializedCustomization } from '@/lib/customization';
import { removeLeadingSlash, removeTrailingSlash } from '@/lib/paths';
import { getResponseCookiesForVisitorAuth, getVisitorToken } from '@/lib/visitor-token';
import { serveResizedImage } from '@/routes/image';
import { getPublishedContentByURL } from '@v2/lib/data';
import { GITBOOK_ASSETS_URL, GITBOOK_URL } from '@v2/lib/env';
import { MiddlewareHeaders } from '@v2/lib/middleware';

export const config = {
    matcher: ['/((?!_next/static|_next/image).*)'],
};

type URLWithMode = { url: URL; mode: 'url' | 'url-host' };

export async function middleware(request: NextRequest) {
    try {
        // Route all requests to a site
        const extracted = getSiteURLFromRequest(request);
        if (extracted) {
            /**
             * Serve image resizing requests (all requests containing `/~gitbook/image`).
             * All URLs containing `/~gitbook/image` are rewritten to `/~gitbook/image`
             * and serve from a single route handler.
             *
             * In GitBook v1: image resizing was done at the root of the hostname (docs.company.com/~gitbook/image)
             * In GitBook v2: image resizing is done at the content level (docs.company.com/section/variant/~gitbook/image)
             */
            if (extracted.url.pathname.endsWith('/~gitbook/image')) {
                return serveResizedImage(request, {
                    host: extracted.url.host,
                });
            }

            return serveSiteByURL(request, extracted);
        }

        // Handle the rest with the router default logic
        return NextResponse.next();
    } catch (error) {
        return serveErrorResponse(error as Error);
    }
}

/**
 * Serve site by URL.
 */
async function serveSiteByURL(request: NextRequest, urlWithMode: URLWithMode) {
    const { url, mode } = urlWithMode;

    // Visitor authentication
    // @ts-ignore - request typing
    const visitorToken = getVisitorToken(request, url);

    const result = await getPublishedContentByURL({
        url: url.toString(),
        visitorAuthToken: visitorToken?.token ?? null,
        // When the visitor auth token is pulled from the cookie, set redirectOnError when calling getPublishedContentByUrl to allow
        // redirecting when the token is invalid as we could be dealing with stale token stored in the cookie.
        // For example when the VA backend signature has changed but the token stored in the cookie is not yet expired.
        redirectOnError: visitorToken?.source === 'visitor-auth-cookie',
    });

    if (result.error) {
        throw result.error;
    }

    const { data } = result;

    if ('redirect' in data) {
        return NextResponse.redirect(data.redirect);
    }

    // When visitor has authentication (adaptive content or VA), we serve dynamic routes.
    let routeType = visitorToken ? 'dynamic' : 'static';

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(MiddlewareHeaders.RouteType, routeType);
    requestHeaders.set(MiddlewareHeaders.URLMode, mode);
    requestHeaders.set(MiddlewareHeaders.SiteURL, `${url.origin}${data.basePath}`);
    requestHeaders.set(MiddlewareHeaders.SiteURLData, JSON.stringify(data));

    // Preview of customization/theme
    const customization = url.searchParams.get('customization');
    if (customization && validateSerializedCustomization(customization)) {
        routeType = 'dynamic';
        requestHeaders.set(MiddlewareHeaders.Customization, customization);
    }
    const theme = url.searchParams.get('theme');
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

    const route = [
        'sites',
        routeType,
        mode,
        encodeURIComponent(url.host + data.basePath),
        encodePathInSiteContent(data.pathname),
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

    if (visitorToken) {
        const cookies = getResponseCookiesForVisitorAuth(data.basePath, visitorToken);
        for (const [key, value] of Object.entries(cookies)) {
            response.cookies.set(key, value.value, value.options);
        }
    }

    return response;
}

/**
 * Serve an error response.
 */
function serveErrorResponse(error: Error) {
    if (error instanceof GitBookAPIError) {
        return NextResponse.json(
            { error: error.message },
            { status: 500, headers: { 'content-type': 'application/json' } }
        );
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

    const isMainHost =
        (GITBOOK_URL && request.nextUrl.host === new URL(GITBOOK_URL).host) ||
        (process.env.VERCEL_URL && request.nextUrl.host === process.env.VERCEL_URL);
    const isAssetsHost =
        GITBOOK_ASSETS_URL && request.nextUrl.host === new URL(GITBOOK_ASSETS_URL).host;

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
        console.log('xForwardedHost', xForwardedHost, request.nextUrl.host);
        console.log('env', {
            VERCEL_URL: process.env.VERCEL_URL,
            GITBOOK_URL: GITBOOK_URL,
            GITBOOK_ASSETS_URL: GITBOOK_ASSETS_URL,
        });
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
function encodePathInSiteContent(rawPathname: string) {
    const pathname = removeLeadingSlash(removeTrailingSlash(rawPathname));

    if (pathname.match(/^~gitbook\/ogimage\/\S+$/)) {
        return pathname;
    }

    switch (pathname) {
        case '~gitbook/icon':
        case '~gitbook/image':
        case 'llms.txt':
        case 'sitemap.xml':
        case 'robots.txt':
            return pathname;
        default:
            return encodeURIComponent(pathname || '/');
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
