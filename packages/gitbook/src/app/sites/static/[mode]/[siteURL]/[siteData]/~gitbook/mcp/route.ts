import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { createMcpHandler } from 'mcp-handler';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

async function handler(request: NextRequest, { params }: { params: Promise<RouteLayoutParams> }) {
    const { context } = await getStaticSiteContext(await params);

    const mcpHandler = createMcpHandler(
        (server) => {
            server.tool(
                'roll_dice',
                'Rolls an N-sided die',
                {
                    sides: z.number().int().min(2),
                },
                async ({ sides }) => {
                    const value = 1 + Math.floor(Math.random() * sides);
                    return {
                        content: [{ type: 'text', text: `🎲 You rolled a ${value}!` }],
                    };
                }
            );
        },
        {
            // Optional server options
        },
        {
            basePath: context.linker.toPathInSite('~gitbook/'),
            streamableHttpEndpoint: '/mcp',
            maxDuration: 60,
            verboseLogs: true,
            disableSse: true,
        }
    );

    return mcpHandler(request);
}

export { handler as GET, handler as POST };
