import {
    type RouteLayoutParams,
    getDynamicSiteContext,
    getSiteURLDataFromParams,
} from '@/app/utils';
import { getVisitorAuthBasePath } from '@/lib/data';
import { resolveUpstreamAuthURL } from '@/lib/site-auth-urls';
import { getVisitorAuthCookieName } from '@/lib/visitors';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Clear the site-scoped auth session cookies and redirect to the upstream auth provider
 * logout URL of the site, or to the site root when not configured.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const resolvedParams = await params;
    const [{ context }, siteURLData, cookieStore] = await Promise.all([
        getDynamicSiteContext(resolvedParams),
        getSiteURLDataFromParams(resolvedParams),
        cookies(),
    ]);

    cookieStore.delete(
        getVisitorAuthCookieName(
            getVisitorAuthBasePath(new URL(request.nextUrl.toString()), siteURLData)
        )
    );

    const noLogoutFallbackURL = context.linker.toAbsoluteURL(context.linker.toPathInSite(''));
    const logoutURL = resolveUpstreamAuthURL({
        siteAuthURL: context.site.urls.logout,
        // Default the location to the site root, so the upstream logout can send the visitor back
        // to the site. On a site behind visitor auth, coming back re-enters the login flow and
        // surfaces the upstream login page, as the visitor no longer has a session on either side.
        location: request.nextUrl.searchParams.get('location') ?? '/',
    });

    return NextResponse.redirect(logoutURL ?? noLogoutFallbackURL);
}
