import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { serveSiteMcpServerCard } from '@/lib/mcp/serverCard';

async function handler(request: NextRequest, { params }: { params: Promise<RouteLayoutParams> }) {
    const { context } = await getDynamicSiteContext(await params);
    return serveSiteMcpServerCard(context, request);
}

export { handler as GET, handler as OPTIONS };
