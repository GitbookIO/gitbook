import { SiteInsightsDisplayContext } from '@gitbook/api';
import type { NextRequest } from 'next/server';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { trackServerInsightsEvents } from '@/lib/tracking';
import { waitUntil } from '@/lib/waitUntil';
import { serveLLMsTxt } from '@/routes/llms';

export const dynamic = 'force-static';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);

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

    return serveLLMsTxt(context, { withMarkdownPages: true });
}
