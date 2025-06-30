import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { serveRobotsTxt } from '@/routes/robots';

export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);
    return serveRobotsTxt(context);
}
