import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { resolveUpstreamAuthURL } from '@/lib/site-auth-urls';

/**
 * Redirect to the upstream auth provider login URL of site, or to the site root when not configured.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getDynamicSiteContext(await params);
    const noLoginFallbackURL = context.linker.toAbsoluteURL(context.linker.toPathInSite(''));
    const loginURL = resolveUpstreamAuthURL({
        siteAuthURL: context.site.urls.login,
        location: request.nextUrl.searchParams.get('location'),
    });

    return NextResponse.redirect(loginURL ?? noLoginFallbackURL);
}
