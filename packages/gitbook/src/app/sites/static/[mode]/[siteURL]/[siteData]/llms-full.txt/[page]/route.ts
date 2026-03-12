import { SiteInsightsDisplayContext } from '@gitbook/api';
import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { trackServerInsightsEvents } from '@/lib/tracking';
import { waitUntil } from '@/lib/waitUntil';
import { serveLLMsFullTxt } from '@/routes/llms-full';

export const dynamic = 'force-static';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams & { page: string }> }
) {
    const awaitedParams = await params;
    const page = Number(awaitedParams.page);
    // If page is not a number, not an integer, or less than 0, return an error
    if (Number.isNaN(page) || !Number.isInteger(page) || page < 0) {
        return new Response('Invalid page', { status: 400 });
    }
    const { context } = await getStaticSiteContext(awaitedParams);

    waitUntil(
        trackServerInsightsEvents({
            organizationId: context.organizationId,
            siteId: context.site.id,
            events: [
                {
                    type: 'page_view',
                    location: {
                        displayContext: SiteInsightsDisplayContext.Mcp,
                    },
                },
            ],
            request,
        })
    );

    return serveLLMsFullTxt(context, page);
}
