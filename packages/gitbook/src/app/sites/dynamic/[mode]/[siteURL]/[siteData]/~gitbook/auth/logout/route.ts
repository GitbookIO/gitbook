import {
    type RouteLayoutParams,
    getDynamicSiteContext,
    getSiteURLDataFromParams,
} from '@/app/utils';
import { writeResponseCookies } from '@/lib/cookies';
import { getVisitorAuthBasePath } from '@/lib/data';
import { getResponseCookiesForAuthLogout } from '@/lib/visitors';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Clear the site-scoped auth session cookies and redirect to the site root.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const resolvedParams = await params;
    const [{ context }, siteURLData] = await Promise.all([
        getDynamicSiteContext(resolvedParams),
        getSiteURLDataFromParams(resolvedParams),
    ]);

    return writeResponseCookies(
        // TODO: Redirect to the site root for now. Once the API supports it,
        // optionally redirect to a logoutURL (e.g when needing to logout from upstream auth too)
        // when defined in visitor auth settings.
        NextResponse.redirect(context.linker.toAbsoluteURL(context.linker.toPathInSite(''))),
        getResponseCookiesForAuthLogout(
            getVisitorAuthBasePath(new URL(request.nextUrl.toString()), siteURLData)
        )
    );
}
