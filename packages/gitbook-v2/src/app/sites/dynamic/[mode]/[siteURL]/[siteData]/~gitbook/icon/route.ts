import type { NextRequest } from 'next/server';

import { serveIcon } from '@/routes/icon';
import { type RouteLayoutParams, getDynamicSiteContext } from '@v2/app/utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getDynamicSiteContext(await params);
    return serveIcon(context, request);
}
