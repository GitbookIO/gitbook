import { createMcpHandler } from 'mcp-handler';
import type { NextRequest } from 'next/server';

import { SiteInsightsDisplayContext } from '@gitbook/api';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { isSiteMcpEnabled } from '@/lib/mcp/endpoints';
import { MCP_SERVER_INFO } from '@/lib/mcp/serverCard';
import { createSiteMcpTools, registerSiteMcpTools, trackMcpEvent } from '@/lib/mcp/tools';

export async function handleMcpRequest(
    rawRequest: NextRequest,
    params: RouteLayoutParams,
    endpoint: '~gitbook/mcp' | '~gitbook/mcp/auth'
) {
    const { context } = await getDynamicSiteContext(params);

    if (!isSiteMcpEnabled(context)) {
        return new Response('Not Found', { status: 404 });
    }

    // Next.js request.url is the original URL and not the rewritten one from the middleware
    const requestURL = new URL(context.linker.toAbsoluteURL(context.linker.toPathInSite(endpoint)));
    requestURL.search = rawRequest.nextUrl.search;
    const request = new Request(requestURL, rawRequest);

    trackMcpEvent({
        organizationId: context.organizationId,
        siteId: context.site.id,
        events: [
            {
                type: 'mcp_request',
                location: {
                    displayContext: SiteInsightsDisplayContext.Server,
                },
            },
        ],
        request,
    });

    const mcpHandler = createMcpHandler(
        (server) => {
            registerSiteMcpTools(server, createSiteMcpTools(context, { request }));
        },
        {
            // The same identity the server card republishes, so the card and the handshake agree.
            serverInfo: MCP_SERVER_INFO,
        },
        {
            streamableHttpEndpoint: context.linker.toPathInSite(endpoint),
            maxDuration: 60,
            verboseLogs: true,
            disableSse: true,
        }
    );

    return mcpHandler(request);
}
