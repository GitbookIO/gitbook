import type { NextRequest } from 'next/server';

import { serveRobotsTxt } from '@/routes/robots';
import { type RouteLayoutParams, getDynamicSiteContext } from '@v2/app/utils';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const context = await getDynamicSiteContext(await params);
    return serveRobotsTxt(context);
}
