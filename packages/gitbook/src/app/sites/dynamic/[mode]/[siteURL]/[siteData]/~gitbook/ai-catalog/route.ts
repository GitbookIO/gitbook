import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { serveSiteAiCatalog } from '@/lib/aiCatalog';

async function handler(request: NextRequest, { params }: { params: Promise<RouteLayoutParams> }) {
    const { context } = await getDynamicSiteContext(await params);
    return serveSiteAiCatalog(context, request);
}

export { handler as GET, handler as OPTIONS };
