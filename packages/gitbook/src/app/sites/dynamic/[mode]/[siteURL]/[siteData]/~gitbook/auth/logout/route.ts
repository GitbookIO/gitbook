import {
    type RouteLayoutParams,
    getDynamicSiteContext,
    getSiteURLDataFromParams,
} from '@/app/utils';
import { getVisitorAuthBasePath } from '@/lib/data';
import { getVisitorAuthCookieName } from '@/lib/visitors';
import { cookies } from 'next/headers';
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

    // TODO: Redirect to the site root for now. Once the API supports it,
    // optionally redirect to a logoutURL (e.g when needing to logout from upstream auth too)
    // when defined in visitor auth settings.
    return NextResponse.redirect(context.linker.toAbsoluteURL(context.linker.toPathInSite('')));
}
