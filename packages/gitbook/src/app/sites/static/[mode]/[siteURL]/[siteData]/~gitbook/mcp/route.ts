import { SiteInsightsDisplayContext } from '@gitbook/api';

import { type RouteLayoutParams, getStaticSiteContext } from '@/app/utils';
import { getDataOrNull, getExposableError, throwIfDataError } from '@/lib/data';
import { getMarkdownForPage, getMarkdownForPageInSpace } from '@/lib/markdownPage';
import { matchPagePath, resolveFirstDocument, resolvePagePathDocumentOrGroup } from '@/lib/pages';
import { joinPathWithBaseURL, removeLeadingSlash, removeTrailingSlash } from '@/lib/paths';
import { findSiteSpaceBy, findSiteSpaceByUrl } from '@/lib/sites';
import { trackServerInsightsEvents } from '@/lib/tracking';
import { waitUntil } from '@/lib/waitUntil';
import { createMcpHandler } from 'mcp-handler';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

async function handler(
    rawRequest: NextRequest,
    { params }: { params: Promise<RouteLayoutParams> }
) {
    const { context } = await getStaticSiteContext(await params);
    const { dataFetcher, linker, site } = context;

    // Next.js request.url is the original URL and not the rewritten one from the middleware
    const requestURL = new URL(
        context.linker.toAbsoluteURL(context.linker.toPathInSite('~gitbook/mcp'))
    );
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

                    // Track the search event server-side
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

            const siteUrl = context.siteSpace.urls.published ?? 'https://docs.example.com';
            server.tool(
                'getPage',
                `Fetch the full markdown content of a specific documentation page from ${site.title}. Use this when you have a page URL and want to read its content. Accepts full URLs (e.g. ${siteUrl}/getting-started) or relative paths (e.g. getting-started).`,
                {
                    url: z.string().describe('The URL or path of the page to fetch'),
                },
                async ({ url }) => {
                    try {
                        // Fast path: try the current space first
                        const currentSpaceUrl = context.siteSpace.urls.published;
                        if (currentSpaceUrl) {
                            const localMatch = matchPagePath(url, currentSpaceUrl);
                            if (localMatch.matches) {
                                const pageLookup = resolvePagePathDocumentOrGroup(
                                    context.revision.pages,
                                    localMatch.pagePath
                                );

                                if (pageLookup) {
                                    const markdown = await getMarkdownForPage(context, pageLookup);
                                    return {
                                        content: [{ type: 'text', text: markdown }],
                                    };
                                }
                            }
                        }

                        // Multi-space fallback, find the site space the URL belongs to
                        const match = findSiteSpaceByUrl(context.structure, url);
                        if (match) {
                            // Handle empty path (root URL of another space)
                            if (!match.pagePath) {
                                const revision = await getDataOrNull(
                                    dataFetcher.getRevision({
                                        spaceId: match.siteSpace.space.id,
                                        revisionId: match.siteSpace.space.revision,
                                    })
                                );
                                if (revision) {
                                    const firstDoc = resolveFirstDocument(revision.pages, []);
                                    if (firstDoc) {
                                        const markdown = await getMarkdownForPageInSpace(
                                            context,
                                            match.siteSpace,
                                            firstDoc.page
                                        );
                                        return {
                                            content: [{ type: 'text', text: markdown }],
                                        };
                                    }
                                }
                            } else {
                                const page = await getDataOrNull(
                                    dataFetcher.getRevisionPageByPath({
                                        spaceId: match.siteSpace.space.id,
                                        revisionId: match.siteSpace.space.revision,
                                        path: match.pagePath,
                                    })
                                );

                                if (page) {
                                    const markdown = await getMarkdownForPageInSpace(
                                        context,
                                        match.siteSpace,
                                        page
                                    );
                                    return {
                                        content: [{ type: 'text', text: markdown }],
                                    };
                                }
                            }
                        }

                        // Relative path fallback, treat as a path in the current space
                        let pathToResolve: string;
                        try {
                            pathToResolve = new URL(url).pathname;
                        } catch {
                            pathToResolve = url;
                        }
                        const normalizedPath = removeLeadingSlash(
                            removeTrailingSlash(pathToResolve)
                        );
                        const relativeLookup = resolvePagePathDocumentOrGroup(
                            context.revision.pages,
                            normalizedPath
                        );
                        if (relativeLookup) {
                            const markdown = await getMarkdownForPage(context, relativeLookup);
                            return {
                                content: [{ type: 'text', text: markdown }],
                            };
                        }

                        return {
                            content: [{ type: 'text', text: `Page not found: "${url}"` }],
                            isError: true,
                        };
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
