import type { NextRequest } from 'next/server';

import { serveLLMsTxt } from '@/routes/llms';
import { type RouteLayoutParams, getDynamicSiteContext } from '@v2/app/utils';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const context = await getDynamicSiteContext(await params);
    return serveLLMsTxt(context);
}
