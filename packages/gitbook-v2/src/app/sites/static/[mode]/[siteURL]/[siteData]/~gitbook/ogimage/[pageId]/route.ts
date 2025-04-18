import type { NextRequest } from 'next/server';

import type { PageIdParams } from '@/components/SitePage';
import { serveOGImage } from '@/routes/ogimage';
import { type RouteLayoutParams, getStaticSiteContext } from '@v2/app/utils';

export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams & PageIdParams> }
) {
    const { context } = await getStaticSiteContext(await params);
    return serveOGImage(context, await params);
}
