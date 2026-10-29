import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
    type RouteLayoutParams,
    getDynamicSiteContext,
    getSiteURLDataFromParams,
} from '@/app/utils';
import { getVisitorAuthBasePath } from '@/lib/data';
import { resolveUpstreamAuthURL } from '@/lib/site-auth-urls';
import { getVisitorAuthClearCookieHeaders } from '@/lib/visitors';

/**
 * Clear the site-scoped auth session cookies and redirect to the upstream auth provider
 * logout URL of the site, or to the site root when not configured.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    // A router prefetch is not a visitor intent to log out, so it must not clear the session.
    // Next.js sends different values depending on the prefetch kind, hence the presence check.
    if (request.headers.has('next-router-prefetch')) {
        return new NextResponse(null, { status: 204 });
    }

    const resolvedParams = await params;
    const [{ context }, siteURLData] = await Promise.all([
        getDynamicSiteContext(resolvedParams),
        getSiteURLDataFromParams(resolvedParams),
    ]);

    const noLogoutFallbackURL = context.linker.toAbsoluteURL(context.linker.toPathInSite(''));
    const logoutURL = resolveUpstreamAuthURL({
        siteAuthURL: context.site.urls.logout,
        // Default the location to the site root, so the upstream logout can send the visitor back
        // to the site. On a site behind visitor auth, coming back re-enters the login flow and
        // surfaces the upstream login page, as the visitor no longer has a session on either side.
        location: request.nextUrl.searchParams.get('location') ?? '/',
    });

    const response = NextResponse.redirect(logoutURL ?? noLogoutFallbackURL);
    // Appended as raw headers: `cookies()` keeps one cookie per name.
    for (const header of getVisitorAuthClearCookieHeaders(
        getVisitorAuthBasePath(new URL(request.nextUrl.toString()), siteURLData)
    )) {
        response.headers.append('set-cookie', header);
    }
    return response;
}
