import { SiteInsightsDisplayContext } from '@gitbook/api';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { getExposableError, throwIfDataError } from '@/lib/data';
import { getMarkdownForPageInSpace } from '@/lib/markdownPage';
import { resolvePagePath } from '@/lib/pages';
import { joinPathWithBaseURL } from '@/lib/paths';
import { findSiteSpaceBy, findSiteSpaceByUrl } from '@/lib/sites';
import { trackServerInsightsEvents } from '@/lib/tracking';
import { waitUntil } from '@/lib/waitUntil';
import { createMcpHandler } from 'mcp-handler';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

export async function handleMcpRequest(
    rawRequest: NextRequest,
    params: RouteLayoutParams,
    endpoint: '~gitbook/mcp' | '~gitbook/mcp/auth'
) {
    const { context } = await getDynamicSiteContext(params);
    const { dataFetcher, linker, site } = context;

    // Next.js request.url is the original URL and not the rewritten one from the middleware
    const requestURL = new URL(context.linker.toAbsoluteURL(context.linker.toPathInSite(endpoint)));
    requestURL.search = rawRequest.nextUrl.search;
    const request = new Request(requestURL, rawRequest);

    waitUntil(
        trackServerInsightsEvents({
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
        })
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

                    waitUntil(
                        trackServerInsightsEvents({
                            organizationId: context.organizationId,
                            siteId: site.id,
                            events: [
                                {
                                    type: 'search_type_query',
                                    query,
                                    location: {
                                        displayContext: SiteInsightsDisplayContext.Mcp,
                                    },
                                },
                            ],
                            request,
                        })
                    );

                    return {
                        content: results.flatMap((result) => {
                            if (result.type === 'record') {
                                return {
                                    type: 'text',
                                    text: [
                                        `Title: ${result.title}`,
                                        `Link: ${result.url}`,
                                        result.description ? `Content: ${result.description}` : '',
                                    ]
                                        .filter(Boolean)
                                        .join('\n'),
                                };
                            }

                            const found = findSiteSpaceBy(
                                context.structure,
                                (siteSpace) => siteSpace.space.id === result.id
                            );
                            const spaceURL = found?.siteSpace.urls.published;
                            if (!spaceURL) {
                                return [];
                            }

                            return result.pages.map((pageResult) => {
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

            const siteUrl = context.siteSpace.urls.published;
            server.tool(
                'getPage',
                `Fetch the full markdown content of a specific documentation page from ${site.title}. Use this when you have a page URL and want to read its content. Accepts full URLs (e.g. ${siteUrl}/getting-started). Since \`searchDocumentation\` returns partial content, use \`getPage\` to retrieve the complete page when you need more details. The content includes links you can follow to navigate to related pages.`,
                {
                    url: z
                        .string()
                        .describe('The URL of the page to fetch')
                        .transform((value, ctx) => {
                            if (URL.canParse(value)) {
                                return value;
                            }
                            if (URL.canParse(`https://${value}`)) {
                                return `https://${value}`;
                            }
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: `"${value}" is not a valid URL. Expected a full URL like ${siteUrl}/getting-started`,
                            });
                            return z.NEVER;
                        }),
                },
                async ({ url }) => {
                    try {
                        const match = findSiteSpaceByUrl(context.structure, url);
                        if (!match) {
                            return {
                                content: [{ type: 'text', text: `Page not found: "${url}"` }],
                                isError: true,
                            };
                        }

                        const revision = await throwIfDataError(
                            dataFetcher.getRevision({
                                spaceId: match.siteSpace.space.id,
                                revisionId: match.siteSpace.space.revision,
                            })
                        );

                        const resolved = resolvePagePath(revision.pages, match.pagePath ?? '');
                        if (!resolved) {
                            return {
                                content: [{ type: 'text', text: `Page not found: "${url}"` }],
                                isError: true,
                            };
                        }

                        const markdown = await getMarkdownForPageInSpace(
                            context,
                            match.siteSpace,
                            resolved.page
                        );

                        waitUntil(
                            trackServerInsightsEvents({
                                organizationId: context.organizationId,
                                siteId: site.id,
                                events: [
                                    {
                                        type: 'page_view',
                                        location: {
                                            displayContext: SiteInsightsDisplayContext.Mcp,
                                            page: resolved.page.id,
                                            space: match.siteSpace.space.id,
                                            revision: match.siteSpace.space.revision,
                                        },
                                    },
                                ],
                                request,
                            })
                        );

                        return { content: [{ type: 'text', text: markdown }] };
                    } catch (error) {
                        const exposable = getExposableError(error);
                        return {
                            content: [{ type: 'text', text: exposable.message }],
                            isError: true,
                        };
                    }
                }
            );
        },
        {},
        {
            streamableHttpEndpoint: context.linker.toPathInSite(endpoint),
            maxDuration: 60,
            verboseLogs: true,
            disableSse: true,
        }
    );

    return mcpHandler(request);
}
