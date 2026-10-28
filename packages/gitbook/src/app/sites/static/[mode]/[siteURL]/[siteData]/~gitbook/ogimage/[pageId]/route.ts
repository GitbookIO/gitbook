import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import type { PageIdParams } from '@/components/SitePage';
import { serveOGImage } from '@/routes/ogimage';

export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams & PageIdParams> }
) {
    const { context } = await getStaticSiteContext(await params);
    return serveOGImage(context, await params);
}
