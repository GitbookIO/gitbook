import type { NextRequest } from 'next/server';

import type { PageIdParams } from '@/components/SitePage';
import { serveOGImage } from '@/routes/ogimage';
import { type RouteLayoutParams, getDynamicSiteContext } from '@v2/app/utils';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams & PageIdParams> }
) {
    const { context } = await getDynamicSiteContext(await params);
    return serveOGImage(context, await params);
}
