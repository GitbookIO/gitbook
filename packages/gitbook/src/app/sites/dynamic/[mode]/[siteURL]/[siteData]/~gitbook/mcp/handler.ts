import {
    CustomizationPageActionType,
    SiteFindingType,
    SiteInsightsDisplayContext,
} from '@gitbook/api';

import { type RouteLayoutParams, getDynamicSiteContext } from '@/app/utils';
import { isAIEnabled } from '@/components/utils/isAIChatEnabled';
import { renderAskSourcesMarkdown, streamSiteAskAnswer } from '@/lib/ask';
import { getExposableError, throwIfDataError } from '@/lib/data';
import { fromPageMarkdown, getMarkdownForPageInSpace, toPageMarkdown } from '@/lib/markdownPage';
import { resolvePagePath } from '@/lib/pages';
import { joinPathWithBaseURL } from '@/lib/paths';
import { getBestScoredResult } from '@/lib/search';
import { findSiteSpaceBy, findSiteSpaceByUrl } from '@/lib/sites';
import { trackServerInsightsEvents } from '@/lib/tracking';
import { waitUntil } from '@/lib/waitUntil';
import { createMcpHandler } from 'mcp-handler';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Fire-and-forget insights tracking for the MCP endpoint. A tracking failure (e.g. a 422 from the
 * insights API) must never reject into the request lifecycle, or it surfaces as an MCP transport error.
 */
function trackMcpEvent(args: Parameters<typeof trackServerInsightsEvents>[0]) {
    waitUntil(
        trackServerInsightsEvents(args).catch((error) => {
            console.error('Failed to track MCP insights event:', error);
        })
    );
}

export async function handleMcpRequest(
    rawRequest: NextRequest,
    params: RouteLayoutParams,
    endpoint: '~gitbook/mcp' | '~gitbook/mcp/auth'
) {
    const { context } = await getDynamicSiteContext(params);
    const { dataFetcher, linker, site } = context;

    const { pageActions } = context.customization;
    const isMcpEnabled = pageActions.items.includes(CustomizationPageActionType.Mcp);
    if (!isMcpEnabled) {
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
            server.tool(
                'searchDocumentation',
                `Search across the documentation to find relevant information, code examples, API references, and guides. Use this tool when you need to answer questions about ${site.title}, find specific documentation, understand how features work, or locate implementation details. The search returns contextual content with titles and direct links to the documentation pages.`,
                {
                    query: z.string(),
                },
                {
                    title: 'Search documentation',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: true,
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

                    trackMcpEvent({
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
                    });

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

                                const body = getBestScoredResult(
                                    (pageResult.sections ?? []).filter((section) => section.body)
                                )?.body;

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
                {
                    title: 'Get page content',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: true,
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

                        trackMcpEvent({
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
                        });

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

            // Only expose the answer tool when the site has AI enabled, since it relies on
            // the same AI search backend that powers the site's "ask a question" experience.
            if (isAIEnabled(context.customization.ai.mode)) {
                server.tool(
                    'askQuestion',
                    `Ask a natural-language question about ${site.title} and get a synthesized answer, with links to the source pages. Prefer this over \`searchDocumentation\` when you want a direct answer to a question rather than a list of matching pages; use \`searchDocumentation\`/\`getPage\` when you need to browse or read full pages yourself.`,
                    {
                        question: z
                            .string()
                            .describe(
                                `The natural-language question to answer about ${site.title}.`
                            ),
                        goal: z
                            .string()
                            .optional()
                            .describe(
                                'The broader end goal you are ultimately trying to accomplish (as/on behalf of the user). Used to tailor the answer to be most useful for your goal. Optional.'
                            ),
                    },
                    {
                        title: 'Ask a question',
                        readOnlyHint: true,
                        destructiveHint: false,
                        idempotentHint: false,
                        openWorldHint: true,
                    },
                    async ({ question, goal }) => {
                        try {
                            const trimmedQuestion = question.trim();
                            if (!trimmedQuestion) {
                                return {
                                    content: [
                                        {
                                            type: 'text',
                                            text: 'Please provide a question to answer.',
                                        },
                                    ],
                                    isError: true,
                                };
                            }

                            const trimmedGoal = goal?.trim() || undefined;

                            const answer = await streamSiteAskAnswer(context, trimmedQuestion, {
                                goal: trimmedGoal,
                            });

                            trackMcpEvent({
                                organizationId: context.organizationId,
                                siteId: site.id,
                                events: [
                                    {
                                        type: 'ask_question',
                                        query: trimmedQuestion,
                                        ...(trimmedGoal ? { goal: trimmedGoal } : {}),
                                        location: {
                                            displayContext: SiteInsightsDisplayContext.Mcp,
                                        },
                                    },
                                ],
                                request,
                            });

                            if (!answer || !answer.answer || !('markdown' in answer.answer)) {
                                return {
                                    content: [
                                        {
                                            type: 'text',
                                            text: "We couldn't answer this question.",
                                        },
                                    ],
                                };
                            }

                            const answerMarkdown = toPageMarkdown(
                                await fromPageMarkdown(context, {
                                    markdown: answer.answer.markdown,
                                    pagePath: '',
                                })
                            );
                            const sourcesMarkdown = await renderAskSourcesMarkdown(
                                context,
                                answer.sources ?? []
                            );

                            let text = answerMarkdown.trim();
                            if (sourcesMarkdown) {
                                text += `\n\n# Sources\n\n${sourcesMarkdown}`;
                            }

                            return { content: [{ type: 'text', text }] };
                        } catch (error) {
                            const exposable = getExposableError(error);
                            return {
                                content: [{ type: 'text', text: exposable.message }],
                                isError: true,
                            };
                        }
                    }
                );
            }

            server.tool(
                'sendFeedback',
                `Report an issue in the documentation of ${site.title} so the team can fix it. Use it whenever, while helping a user, you come across content that is outdated, contradictory, missing information, or otherwise unhelpful. Also use it when the user themselves reports a problem with the docs, even if you could not verify it yourself. If it's your own observation, do a quick sanity check that the issue is real before reporting — no need to exhaustively re-read the page. Send one call per distinct issue and do not report the same issue twice in a conversation. Do not use this tool to confirm that a page is accurate; it is for reporting problems only.`,
                {
                    category: z
                        .nativeEnum(SiteFindingType)
                        .describe(
                            'The kind of issue. "content-outdated": the content was correct at some point but no longer matches the current product or reality. "incoherence": the content contradicts itself or another page. "content-gap": information the reader needs is missing entirely, whether or not it was ever documented. "other": only as a last resort when none of the above fits.'
                        ),
                    content: z
                        .string()
                        .min(1)
                        .max(2048)
                        .describe(
                            'Explain the issue in full, as if writing to a documentation maintainer who never saw this conversation. Describe what is wrong, where on the page it appears (quote the exact sentence or section title when possible), what the user was trying to do, and, when relevant, what the correct or expected information should be. Write a few clear, specific sentences in English. Never include personal or confidential information from the conversation. Up to 2048 characters.'
                        ),
                    pageUrl: z
                        .string()
                        .describe(
                            `The full URL of the page the issue is about (e.g. ${siteUrl}/getting-started). Provide it whenever you can so the finding is linked to the exact page.`
                        )
                        .transform((value, ctx) => {
                            const candidate = URL.canParse(value)
                                ? new URL(value)
                                : URL.canParse(value, siteUrl)
                                  ? new URL(value, siteUrl)
                                  : null;

                            if (
                                !candidate ||
                                (candidate.protocol !== 'https:' && candidate.protocol !== 'http:')
                            ) {
                                ctx.addIssue({
                                    code: z.ZodIssueCode.custom,
                                    message: `"${value}" is not a valid URL on this site. Expected a full URL like ${siteUrl}/getting-started`,
                                });
                                return z.NEVER;
                            }

                            return candidate.toString();
                        })
                        .optional(),
                },
                {
                    title: 'Send feedback',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
                async ({ category, content, pageUrl }) => {
                    try {
                        let pageLocation:
                            | { page: string; space: string; revision: string }
                            | undefined;

                        if (pageUrl) {
                            const match = findSiteSpaceByUrl(context.structure, pageUrl);
                            if (!match) {
                                return {
                                    content: [
                                        { type: 'text', text: `Page not found: "${pageUrl}"` },
                                    ],
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
                                    content: [
                                        { type: 'text', text: `Page not found: "${pageUrl}"` },
                                    ],
                                    isError: true,
                                };
                            }

                            pageLocation = {
                                page: resolved.page.id,
                                space: match.siteSpace.space.id,
                                revision: match.siteSpace.space.revision,
                            };
                        }

                        trackMcpEvent({
                            organizationId: context.organizationId,
                            siteId: site.id,
                            events: [
                                {
                                    type: 'agent_feedback',
                                    feedback: { content, category },
                                    location: {
                                        displayContext: SiteInsightsDisplayContext.Mcp,
                                        ...pageLocation,
                                    },
                                },
                            ],
                            request,
                        });

                        return {
                            content: [{ type: 'text', text: 'Feedback recorded. Thank you.' }],
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
            streamableHttpEndpoint: context.linker.toPathInSite(endpoint),
            maxDuration: 60,
            verboseLogs: true,
            disableSse: true,
        }
    );

    return mcpHandler(request);
}
