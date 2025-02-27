import { GitBookAPIError } from '@gitbook/api';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getContentSecurityPolicy } from '@/lib/csp';
import { removeLeadingSlash, removeTrailingSlash } from '@/lib/paths';
import { getPublishedContentByURL } from '@v2/lib/data';
import { MiddlewareHeaders } from '@v2/lib/middleware';

export const config = {
    matcher: ['/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
};

type URLWithMode = { url: URL; mode: 'url' | 'url-host' };

export async function middleware(request: NextRequest) {
    try {
        const extracted = extractURL(request);
        if (extracted) {
            return serveSiteByURL(request, extracted);
        }

        return NextResponse.next();
    } catch (error) {
        return serveErrorResponse(error as Error);
    }
}

/**
 * Serve site by URL.
 */
async function serveSiteByURL(request: NextRequest, urlWithMode: URLWithMode) {
    const dynamicHeaders = getDynamicHeaders(request);
    const { url, mode } = urlWithMode;

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

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(MiddlewareHeaders.URLMode, mode);
    if (dynamicHeaders) {
        for (const [key, value] of Object.entries(dynamicHeaders)) {
            requestHeaders.set(key, value);
        }
    }

    const route = [
        'sites',
        dynamicHeaders ? 'dynamic' : 'static',
        mode,
        encodeURIComponent(url.host + data.basePath),
        encodePathInSiteContent(data.pathname),
    ].join('/');

    console.log('route', route);

    const response = NextResponse.rewrite(new URL(`/${route}`, request.url), {
        headers: requestHeaders,
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
 * The URL of the GitBook content can be passed in 2 different ways:
 * - Hostname is in the `X-GitBook-Host` header and the pathname is the path in the request URL.
 * - The request URL is matching `/url/:url`
 */
function extractURL(request: NextRequest): URLWithMode | null {
    const xGitbookHost = request.headers.get('x-gitbook-host');
    if (xGitbookHost) {
        return {
            url: new URL(`https://${xGitbookHost}${request.nextUrl.pathname}`),
            mode: 'url-host',
        };
    }

    const prefix = '/url/';
    if (request.nextUrl.pathname.startsWith(prefix)) {
        return {
            url: new URL(`https://${request.nextUrl.pathname.slice(prefix.length)}`),
            mode: 'url',
        };
    }

    return null;
}

/**
 * Evaluate if a request is dynamic or static.
 */
function getDynamicHeaders(_request: NextRequest): null | Record<string, string> {
    // TODO:
    // - check token in query string
    // - check token in cookies
    // - check special headers or query string
    return null;
}

/**
 * Encode path in a site content.
 */
function encodePathInSiteContent(rawPathname: string) {
    const pathname = removeLeadingSlash(removeTrailingSlash(rawPathname));
    switch (pathname) {
        case 'sitemap.xml':
        case 'robots.txt':
            return pathname;
        default:
            return encodeURIComponent(pathname || '/');
    }
}
