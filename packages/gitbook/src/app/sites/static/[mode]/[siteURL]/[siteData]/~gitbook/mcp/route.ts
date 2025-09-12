import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { throwIfDataError } from '@/lib/data';
import { joinPathWithBaseURL } from '@/lib/paths';
import { findSiteSpaceBy } from '@/lib/sites';
import { createMcpHandler } from 'mcp-handler';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

async function handler(request: NextRequest, { params }: { params: Promise<RouteLayoutParams> }) {
    const { context } = await getStaticSiteContext(await params);
    const { dataFetcher, linker, site } = context;

    console.log(
        `mcpHandler pathname=${request.nextUrl.pathname} basePath=${context.linker.toPathInSite('~gitbook/')}`
    );

    const mcpHandler = createMcpHandler(
        (server) => {
            server.tool(
                'searchDocumentation',
                `Search across the documentation to find relevant information, code examples, API references, and guides. Use this tool when you need to answer questions about ${site.title}, find specific documentation, understand how features work, or locate implementation details. The search returns contextual content with titles and direct links to the documentation pages.`,
                {
                    query: z.string(),
                },
                async ({ query }) => {
                    const results = await throwIfDataError(
                        dataFetcher.searchSiteContent({
                            organizationId: context.organizationId,
                            siteId: site.id,
                            query,
                            scope: { mode: 'all' },
                        })
                    );

                    return {
                        content: results.flatMap((spaceResult) => {
                            const found = findSiteSpaceBy(
                                context.structure,
                                (siteSpace) => siteSpace.space.id === spaceResult.id
                            );
                            const spaceURL = found?.siteSpace.urls.published;
                            if (!spaceURL) {
                                return [];
                            }

                            return spaceResult.pages.map((pageResult) => {
                                const pageURL = linker.toAbsoluteURL(
                                    linker.toLinkForContent(
                                        joinPathWithBaseURL(spaceURL, pageResult.path)
                                    )
                                );

                                const body = pageResult.sections
                                    ?.map((section) => section.body)
                                    .join('\n');

                                return {
                                    type: 'text',
                                    text: [
                                        `Title: ${pageResult.title}`,
                                        `Link: ${pageURL}`,
                                        body ? `Content: ${body}` : '',
                                    ]
                                        .filter(Boolean)
                                        .join('\n'),
                                };
                            });
                        }),
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
