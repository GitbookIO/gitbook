import { GitBookAPIError } from '@gitbook/api';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getContentSecurityPolicy } from '@/lib/csp';
import { removeLeadingSlash, removeTrailingSlash } from '@/lib/paths';
import { serveResizedImage } from '@/routes/image';
import { getPublishedContentByURL } from '@v2/lib/data';
import { MiddlewareHeaders } from '@v2/lib/middleware';

export const config = {
    matcher: ['/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
};

type URLWithMode = { url: URL; mode: 'url' | 'url-host' };

export async function middleware(request: NextRequest) {
    try {
        // Route all requests to a site
        const extracted = extractURL(request);
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
                return serveResizedImage(request);
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
    const dynamicHeaders = getDynamicHeaders(url, request);

    const result = await getPublishedContentByURL({
        url: url.toString(),
        visitorAuthToken: null,
        redirectOnError: false,
    });

    if (result.error) {
        throw result.error;
    }

    const { data } = result;

    if ('redirect' in data) {
        return NextResponse.redirect(data.redirect);
    }

    const routeType = dynamicHeaders ? 'dynamic' : 'static';

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(MiddlewareHeaders.RouteType, routeType);
    requestHeaders.set(MiddlewareHeaders.URLMode, mode);
    requestHeaders.set(MiddlewareHeaders.SiteURL, `${url.origin}${data.basePath}`);
    requestHeaders.set(MiddlewareHeaders.SiteURLData, JSON.stringify(data));
    if (dynamicHeaders) {
        for (const [key, value] of Object.entries(dynamicHeaders)) {
            requestHeaders.set(key, value);
        }
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

    console.log(`rewriting to ${route}`);

    const rewrittenURL = new URL(`/${route}`, request.nextUrl.toString());
    const response = NextResponse.rewrite(rewrittenURL, {
        request: {
            headers: requestHeaders,
        },
    });

    // Add Content Security Policy header
    response.headers.set('content-security-policy', getContentSecurityPolicy());

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
 * The URL of the GitBook content can be passed in 3 different ways:
 * - The request URL is in the `X-GitBook-URL` header.
 * - The request URL is matching `/url/:url`
 */
function extractURL(request: NextRequest): URLWithMode | null {
    const xGitbookUrl = request.headers.get('x-gitbook-url');
    if (xGitbookUrl) {
        return {
            url: appendQueryParams(new URL(xGitbookUrl), request.nextUrl.searchParams),
            mode: 'url-host',
        };
    }

    const prefix = '/url/';
    if (request.nextUrl.pathname.startsWith(prefix)) {
        return {
            url: appendQueryParams(
                new URL(`https://${request.nextUrl.pathname.slice(prefix.length)}`),
                request.nextUrl.searchParams
            ),
            mode: 'url',
        };
    }

    return null;
}

/**
 * Evaluate if a request is dynamic or static.
 */
function getDynamicHeaders(_url: URL, _request: NextRequest): null | Record<string, string> {
    // TODO:
    // - check token in query string
    // - check token in cookies
    // - check special headers or query string
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
