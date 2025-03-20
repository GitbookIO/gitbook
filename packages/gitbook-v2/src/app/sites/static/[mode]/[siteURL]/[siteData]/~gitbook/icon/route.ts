import type { NextRequest } from 'next/server';

import { serveIcon } from '@/routes/icon';
import { type RouteLayoutParams, getStaticSiteContext } from '@v2/app/utils';

export const dynamic = 'force-static';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);
    return serveIcon(context, request);
}
