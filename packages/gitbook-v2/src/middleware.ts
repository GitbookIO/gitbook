import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MiddlewareHeaders } from './lib/middleware';

export const config = {
    matcher: ['/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
};

export function middleware(request: NextRequest) {
    const extracted = extractURL(request);
    if (!extracted) {
        return NextResponse.next();
    }

    const dynamicHeaders = getDynamicHeaders(request);
    const { url, mode } = extracted;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(MiddlewareHeaders.URL, url);
    requestHeaders.set(MiddlewareHeaders.URLMode, mode);
    if (dynamicHeaders) {
        for (const [key, value] of Object.entries(dynamicHeaders)) {
            requestHeaders.set(key, value);
        }
    }

    return NextResponse.rewrite(
        new URL(`/${dynamicHeaders ? 'dynamic' : 'static'}/${mode}/${url}`, request.url),
        {
            headers: requestHeaders,
        },
    );
}

/**
 * The URL of the GitBook content can be passed in 2 different ways:
 * - Hostname is in the `X-GitBook-Host` header and the pathname is the path in the request URL.
 * - The request URL is matching `/url/:url`
 */
function extractURL(request: NextRequest): { url: string; mode: 'url' | 'url-host' } | null {
    const xGitbookHost = request.headers.get('x-gitbook-host');
    if (xGitbookHost) {
        return {
            url: `${xGitbookHost}${request.nextUrl.pathname}`,
            mode: 'url-host',
        };
    }

    const prefix = '/url/';
    if (request.nextUrl.pathname.startsWith(prefix)) {
        return {
            url: request.nextUrl.pathname.slice(prefix.length),
            mode: 'url',
        };
    }

    return null;
}

/**
 * Evaluate if a request is dynamic or static.
 */
function getDynamicHeaders(request: NextRequest): null | Record<string, string> {
    // TODO:
    // - check token in query string
    // - check token in cookies
    // - check special headers or query string
    return null;
}
