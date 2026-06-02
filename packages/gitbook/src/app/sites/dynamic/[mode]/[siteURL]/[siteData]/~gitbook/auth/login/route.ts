import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Redirect to the upstream auth provider login URL of site, or to the site root when not configured.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getDynamicSiteContext(await params);
    const noLoginFallbackURL = context.linker.toAbsoluteURL(context.linker.toPathInSite(''));

    if (!context.site.urls.login) {
        return NextResponse.redirect(noLoginFallbackURL);
    }

    try {
        const loginURL = new URL(context.site.urls.login);
        const location = request.nextUrl.searchParams.get('location');
        if (location) {
            loginURL.searchParams.set('location', location);
        }

        return NextResponse.redirect(loginURL);
    } catch (_error) {
        return NextResponse.redirect(noLoginFallbackURL);
    }
}
