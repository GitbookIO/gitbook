import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import type { PageIdParams } from '@/components/SitePage';
import { serveOGImage } from '@/routes/ogimage';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams & PageIdParams> }
) {
    const { context } = await getDynamicSiteContext(await params);
    return serveOGImage(context, await params);
}
