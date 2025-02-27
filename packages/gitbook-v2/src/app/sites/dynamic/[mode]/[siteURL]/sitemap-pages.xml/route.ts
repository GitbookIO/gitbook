import type { NextRequest } from 'next/server';

import { servePagesSitemap } from '@/routes/sitemap';
import { type RouteLayoutParams, getDynamicSiteContext } from '@v2/app/utils';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const context = await getDynamicSiteContext(await params);
    return servePagesSitemap(context);
}
