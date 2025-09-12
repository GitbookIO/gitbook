import { CustomizationThemeMode } from '@gitbook/api';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import rison from 'rison';

import { getContentSecurityPolicy } from '@/lib/csp';
import { validateSerializedCustomization } from '@/lib/customization';
import {
    DataFetcherError,
    getVisitorAuthBasePath,
    lookupPublishedContentByUrl,
    normalizeURL,
    throwIfDataError,
} from '@/lib/data';
import { isGitBookAssetsHostURL, isGitBookHostURL } from '@/lib/env';
import { getImageResizingContextId } from '@/lib/images';
import { MiddlewareHeaders } from '@/lib/middleware';
import { removeLeadingSlash, removeTrailingSlash } from '@/lib/paths';
import {
    type ResponseCookies,
    getPathScopedCookieName,
    getResponseCookiesForVisitorAuth,
    getVisitorData,
    normalizeVisitorURL,
    serveVisitorClaimsDataRequest,
} from '@/lib/visitors';
import { serveResizedImage } from '@/routes/image';
import { cookies } from 'next/headers';
import type { SiteURLData } from './lib/context';
import { serveProxyAnalyticsEvent } from './lib/tracking';
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

        // Reject malicious requests
        const rejectResponse = await validateServerActionRequest(request);
        if (rejectResponse) {
            return rejectResponse;
        }

        for (const handler of [serveSiteRoutes, serveSpacePDFRoutes]) {
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

async function validateServerActionRequest(request: NextRequest) {
    // First thing we need to do is validate that the header is in a correct format.
    if (request.headers.has('next-action')) {
        // A server action id is a 1-byte hex string (2 chars) followed by a 20-byte SHA1 hash (40 chars) = 42 total characters.
        // For ref https://github.com/vercel/next.js/blob/db561cb924cbea0f3384e89f251fc443a8aec1ae/crates/next-custom-transforms/src/transforms/server_actions.rs#L266-L268
        const regex = /^[a-fA-F0-9]{42}$/;
        const match = request.headers.get('next-action')?.match(regex);
        if (!match) {
            return new Response('Invalid request', {
                status: 400,
                headers: { 'content-type': 'text/plain' },
            });
        }

        // We need to reject incorrect server actions requests
        // We do not do it in cloudflare workers as there is a bug that prevents us from reading the request body.
        if (process.env.GITBOOK_RUNTIME !== 'cloudflare') {
            // We just test that the json body is parseable
            try {
                const clonedRequest = request.clone();
                await clonedRequest.json();
            } catch (e) {
                console.warn('Invalid server action request', e);
                // If the body is not parseable, we reject the request
                return new Response('Invalid request', {
                    status: 400,
                    headers: { 'content-type': 'text/plain' },
                });
            }
        }
    }
}

/**
 * Filter malicious requests.
 * @param requestURL The URL of the request to filter.
 * @returns True if the request is malicious, false otherwise.
 */
function shouldFilterMaliciousRequests(requestURL: URL): boolean {
    // We want to filter hostnames that contains a port here as this is likely a malicious request.
    if (requestURL.host.includes(':')) {
        return true;
    }
    // These requests will be rejected by the API anyway, we might as well do it right away.
    if (requestURL.pathname.endsWith(';.jsp')) {
        return true;
    }

    return false;
}

/**
 * Handle request that are targetting the site routes group.
 */
async function serveSiteRoutes(requestURL: URL, request: NextRequest) {
    const match = getSiteURLFromRequest(request);
    if (!match) {
        return null;
    }

    const { url: siteRequestURL, mode } = match;
    const imagesContextId = getImageResizingContextId(siteRequestURL);
    /**
     * Serve image resizing requests (all requests containing `/~gitbook/image`).
     * All URLs containing `/~gitbook/image` are rewritten to `/~gitbook/image`
     * and serve from a single route handler.
     *
     * In GitBook v1: image resizing was done at the root of the hostname (docs.company.com/~gitbook/image)
     * In GitBook v2: image resizing is done at the content level (docs.company.com/section/variant/~gitbook/image)
     */
    if (siteRequestURL.pathname.endsWith('/~gitbook/image')) {
        return await serveResizedImage(request, {
            imagesContextId: imagesContextId,
        });
    }

    //Forwards analytics events
    if (siteRequestURL.pathname.endsWith('/~gitbook/__evt')) {
        return await serveProxyAnalyticsEvent(request);
    }

    // We want to filter hostnames that contains a port here as this is likely a malicious request.
    if (shouldFilterMaliciousRequests(siteRequestURL)) {
        return new Response('Invalid request', {
            status: 400,
            headers: { 'content-type': 'text/plain' },
        });
    }

    // Handler that returns visitor data for the app to consume.
    if (siteRequestURL.pathname.endsWith('/~gitbook/visitor')) {
        return serveVisitorClaimsDataRequest(request, siteRequestURL);
    }

    //
    // Detect and extract the visitor authentication token from the request
    //
    const { visitorToken, unsignedClaims, visitorParamsCookie } = getVisitorData({
        cookies: request.cookies.getAll(),
        url: siteRequestURL,
    });

    //
    // Strip the tracking header to prevent users providing it themselves.
    //
    request.headers.delete('x-gitbook-disable-tracking');

    const withAPIToken = async (apiToken: string | null) => {
        const siteURLData = await throwIfDataError(
            lookupPublishedContentByUrl({
                url: siteRequestURL.toString(),
                visitorPayload: {
                    jwtToken: visitorToken?.token ?? undefined,
                    unsignedClaims,
                },
                // When the visitor auth token is pulled from the cookie, set redirectOnError when calling resolvePublishedContentByUrl to allow
                // redirecting when the token is invalid as we could be dealing with stale token stored in the cookie.
                // For example when the VA backend signature has changed but the token stored in the cookie is not yet expired.
                redirectOnError: visitorToken?.source === 'visitor-auth-cookie',

                // Use the API token passed in the request, if any
                // as it could be used for .preview hostnames
                apiToken,
            })
        );

        const cookies: ResponseCookies = visitorParamsCookie
            ? [
                  // If visitor.* params were passed to the site URL, include a session cookie to persist these params across navigation.
                  visitorParamsCookie,
              ]
            : [];

        //
        // Handle redirects
        //
        if ('redirect' in siteURLData) {
            // biome-ignore lint/suspicious/noConsole: we want to log the redirect
            console.log('redirect', siteURLData.redirect);
            if (siteURLData.target === 'content') {
                let contentRedirect = new URL(siteURLData.redirect, request.url);

                // For content redirects, we redirect using the /url/:url format
                // during development and testing in 'url' mode.
                if (mode === 'url') {
                    const urlObject = new URL(siteURLData.redirect);
                    contentRedirect = new URL(
                        `/url/${urlObject.host}${urlObject.pathname}${urlObject.search}`,
                        request.url
                    );
                }

                // Keep the same search params as the original request
                // as it might contain a VA token
                contentRedirect.search = request.nextUrl.search;

                return NextResponse.redirect(contentRedirect);
            }

            return NextResponse.redirect(siteURLData.redirect);
        }

        cookies.push(
            ...getResponseCookiesForVisitorAuth(
                getVisitorAuthBasePath(siteRequestURL, siteURLData),
                visitorToken
            )
        );

        // We use the host/origin from the canonical URL to ensure the links are
        // correctly generated when the site is proxied. e.g. https://proxy.gitbook.com/site/siteId/...
        const siteCanonicalURL = new URL(siteURLData.canonicalUrl);

        let incomingURL = requestURL;
        // For cases where the site is proxied, we use the canonical URL
        // as the incoming URL along with all the search params from the request.
        if (mode !== 'url') {
            incomingURL = siteCanonicalURL;
            incomingURL.search = requestURL.search;
        }
        //
        // Make sure the URL is clean of any va token after a successful lookup,
        // and of any visitor.* params that may have been passed to the URL.
        //
        // The token and the visitor.* params value are stored in cookies that are set
        // on the redirect response.
        //
        const normalizedVisitorURL = normalizeVisitorURL(incomingURL);
        if (normalizedVisitorURL.toString() !== incomingURL.toString()) {
            return writeResponseCookies(
                NextResponse.redirect(normalizedVisitorURL.toString()),
                cookies
            );
        }

        //
        // Render and serve the content
        //

        // The route is static, except when using dynamic parameters from query params
        // (customization override, theme, etc)
        let routeType: 'dynamic' | 'static' = 'static';

        // We pick only stable data from the siteURL data to prevent re-rendering of
        // the root layout when changing pages..
        const stableSiteURLData: SiteURLData = {
            site: siteURLData.site,
            siteSection: siteURLData.siteSection,
            siteSpace: siteURLData.siteSpace,
            siteBasePath: siteURLData.siteBasePath,
            basePath: siteURLData.basePath,
            space: siteURLData.space,
            organization: siteURLData.organization,
            changeRequest: siteURLData.changeRequest,
            revision: siteURLData.revision,
            shareKey: siteURLData.shareKey,
            apiToken: siteURLData.apiToken,
            imagesContextId: imagesContextId,
            contextId: siteURLData.contextId,
        };

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set(MiddlewareHeaders.RouteType, routeType);
        requestHeaders.set(MiddlewareHeaders.URLMode, mode);
        requestHeaders.set(
            MiddlewareHeaders.SiteURL,
            `${siteCanonicalURL.origin}${siteURLData.basePath}`
        );
        requestHeaders.set(MiddlewareHeaders.SiteURLData, JSON.stringify(stableSiteURLData));

        // Preview of customization/theme
        const customization = siteRequestURL.searchParams.get('customization');
        if (customization && validateSerializedCustomization(customization)) {
            routeType = 'dynamic';
            // We need to encode the customization headers, otherwise it will fail for some customization values containing non ASCII chars on vercel.
            requestHeaders.set(MiddlewareHeaders.Customization, encodeURIComponent(customization));
        }
        const theme = siteRequestURL.searchParams.get('theme');
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

        const siteURLWithoutProtocol = `${siteCanonicalURL.host}${siteURLData.basePath}`;
        const { pathname, routeType: routeTypeFromPathname } = encodePathInSiteContent(
            siteURLData.pathname
        );
        routeType = routeTypeFromPathname ?? routeType;

        const route = [
            'sites',
            routeType,
            mode,
            encodeURIComponent(siteURLWithoutProtocol),
            encodeURIComponent(
                rison.encode(
                    // rison can't encode undefined values
                    Object.fromEntries(
                        Object.entries(stableSiteURLData).filter(
                            ([_, v]) => typeof v !== 'undefined'
                        )
                    )
                )
            ),
            pathname,
        ].join('/');

        const rewrittenURL = new URL(`/${route}`, request.nextUrl.toString());
        rewrittenURL.search = request.nextUrl.search; // Preserve the original search params

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

        // When we use adaptive content, we want to ensure that the cache is not used at all on the client side.
        // Vercel already set this header, this is needed in OpenNext.
        if (siteURLData.contextId) {
            response.headers.set('cache-control', 'public, max-age=0, must-revalidate');
        }

        return writeResponseCookies(response, cookies);
    };

    // For https://preview/<siteURL> requests,
    if (siteRequestURL.hostname === 'preview') {
        // Do not track page views for preview requests
        request.headers.set('x-gitbook-disable-tracking', 'true');

        return serveWithQueryAPIToken(
            // We scope the API token to the site ID.
            `${siteRequestURL.hostname}/${requestURL.pathname.slice(1).split('/')[0]}`,
            request,
            withAPIToken
        );
    }

    return withAPIToken(null);
}

/**
 * Serve routes for PDF export for a space: /~space/:spaceId/~gitbook/pdf
 */
async function serveSpacePDFRoutes(requestURL: URL, request: NextRequest) {
    const pathnameParts = requestURL.pathname.slice(1).split('/');
    if (pathnameParts[0] !== '~space' && pathnameParts[0] !== '~site') {
        return null;
    }

    return serveWithQueryAPIToken(
        pathnameParts.slice(0, 2).join('/'),
        request,
        async (apiToken) => {
            // Handle the rest with the router default logic
            return NextResponse.next({
                headers: {
                    [MiddlewareHeaders.APIToken]: apiToken,
                },
            });
        }
    );
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
 * Server a response with an API token obtained from the query params.
 */
async function serveWithQueryAPIToken(
    scopePath: string,
    request: NextRequest,
    serve: (apiToken: string) => Promise<NextResponse>
) {
    // We store the API token in a cookie that is scoped to the specific route
    // to avoid errors when multiple previews are opened in different tabs.
    const cookieName = getPathScopedCookieName('gitbook-api-token', scopePath);

    // Extract a potential GitBook API token passed in the request
    // If found, we redirect to the same URL but with the token in the cookie
    const queryAPIToken = request.nextUrl.searchParams.get('token');
    if (queryAPIToken) {
        request.nextUrl.searchParams.delete('token');
        return writeResponseCookies(NextResponse.redirect(request.nextUrl.toString()), [
            {
                name: cookieName,
                value: queryAPIToken,
                options: {
                    httpOnly: true,
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60, // 1 hour
                },
            },
        ]);
    }

    const apiToken = request.cookies.get(cookieName)?.value;
    if (!apiToken) {
        throw new DataFetcherError('Missing API token', 400);
    }

    return serve(apiToken);
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

    // If the pathname is a markdown file, we rewrite it to ~gitbook/markdown/:pathname
    if (pathname.match(/\.md$/)) {
        const pagePathWithoutMD = pathname.slice(0, -3);
        return {
            pathname: `~gitbook/markdown/${encodeURIComponent(pagePathWithoutMD)}`,
            // The markdown content is always static and doesn't depend on the dynamic parameter (customization, theme, etc)
            routeType: 'static',
        };
    }

    // We skip encoding for paginated llms-full.txt pages (i.e. llms-full.txt/100)
    if (pathname.match(/^llms-full\.txt\/\d+$/)) {
        return { pathname, routeType: 'static' };
    }

    // If the pathname is an embedded page
    const embedPage = pathname.match(/^~gitbook\/embed\/page\/(\S+)$/);
    if (embedPage) {
        return {
            pathname: `~gitbook/embed/page/${encodeURIComponent(embedPage[1]!)}`,
        };
    }

    switch (pathname) {
        case '~gitbook/embed/assistant':
        case '~gitbook/icon':
            return { pathname };
        case '~gitbook/mcp':
        case 'llms.txt':
        case 'sitemap.xml':
        case 'sitemap-pages.xml':
        case 'robots.txt':
        case '~gitbook/embed/script.js':
        case '~gitbook/embed/demo':
            // LLMs.txt, sitemap, sitemap-pages and robots.txt are always static
            // as they only depend on the site structure / pages.
            return { pathname, routeType: 'static' };
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
async function writeResponseCookies<R extends NextResponse>(
    response: R,
    cookiesToSet: ResponseCookies
): Promise<R> {
    const cookiesFn = await cookies();
    cookiesToSet.forEach((cookie) => {
        // response.cookies.set(cookie.name, cookie.value, cookie.options);
        // For some reason we have to use the cookies function instead of response.cookies.set
        // Without it, it breaks the ai assistant server actions (it thinks it is a static route).
        cookiesFn.set(cookie.name, cookie.value, cookie.options);
    });

    return response;
}
