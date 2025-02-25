import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MiddlewareHeaders } from './lib/middleware';
import { getPublishedContentByURL } from '@v2/lib/data';
import { GitBookAPIError } from '@gitbook/api';

export const config = {
    matcher: ['/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)'],
};

type URLWithMode = { url: URL; mode: 'url' | 'url-host' }

export async function middleware(request: NextRequest) {
    const extracted = extractURL(request);
    if (extracted) {
        return serveSiteByURL(request, extracted);
    }

    return NextResponse.next();
}

/**
 * Serve site by URL.
 */
async function serveSiteByURL(request: NextRequest, urlWithMode: URLWithMode) {
    const dynamicHeaders = getDynamicHeaders(request);
    const { url, mode } = urlWithMode;

    const result = await getPublishedContentByURL(
        {
            url: url.toString(),
            visitorAuthToken: null,
            redirectOnError: false,
        },
    );

    if (result.error) {
        if (result.error instanceof GitBookAPIError) {
            return NextResponse.json(
                {
                    error: result.error.message,
                },
                { status: result.error.code },
            );
        } else {
            throw result.error;
        }
    }

    const { data } = result;

    if ('redirect' in data) {
        return NextResponse.redirect(data.redirect);
    }

    console.log(data);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(MiddlewareHeaders.URL, url);
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
        encodeURIComponent(data.pathname),
    ].join('/');


    console.log('rewrite to', route)

    return NextResponse.rewrite(
        new URL('/' + route, request.url),
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
function getDynamicHeaders(request: NextRequest): null | Record<string, string> {
    // TODO:
    // - check token in query string
    // - check token in cookies
    // - check special headers or query string
    return null;
}
