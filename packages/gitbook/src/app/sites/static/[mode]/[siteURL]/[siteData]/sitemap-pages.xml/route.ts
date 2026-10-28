import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { servePagesSitemap } from '@/routes/sitemap';

export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);
    return servePagesSitemap(context);
}
