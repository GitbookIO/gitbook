import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { serveLLMsFullTxt } from '@/routes/llms-full';

export const dynamic = 'force-static';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams & { startIdx: string }> }
) {
    const awaitedParams = await params;
    const startIdx = Number(awaitedParams.startIdx);
    // If startIdx is not a number, not an integer, or less than 0, return an error
    if (Number.isNaN(startIdx) || !Number.isInteger(startIdx) || startIdx < 0) {
        return new Response('Invalid start index', { status: 400 });
    }
    const { context } = await getStaticSiteContext(awaitedParams);
    return serveLLMsFullTxt(context, startIdx);
}
