import type { NextRequest } from 'next/server';

import { serveLLMsFullTxt } from '@/routes/llms-full';
import { type RouteLayoutParams, getStaticSiteContext } from '@v2/app/utils';

export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);
    return serveLLMsFullTxt(context);
}
