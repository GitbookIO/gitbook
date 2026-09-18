import type { McpServer, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { ZodRawShape } from 'zod';
import { z } from 'zod';

import { AgentFeedbackSource, SiteInsightsDisplayContext } from '@gitbook/api';

import { isAIEnabled } from '@/components/utils/isAIChatEnabled';
import {
    AGENT_FEEDBACK_GOAL_MAX_LENGTH,
    AGENT_FEEDBACK_MAX_LENGTH,
    agentFeedbackDescriptions,
    parseAgentFeedbackPageURL,
} from '@/lib/agentFeedback';
import { submitAgentFeedback } from '@/lib/agentFeedback/server';
import { renderAskSourcesMarkdown, streamSiteAskAnswer } from '@/lib/ask';
import type { GitBookSiteContext } from '@/lib/context';
import { getExposableError, throwIfDataError } from '@/lib/data';
import { fromPageMarkdown, getMarkdownForPageInSpace, toPageMarkdown } from '@/lib/markdownPage';
import { joinPathWithBaseURL } from '@/lib/paths';
import { findSiteSpaceBy, findSiteSpaceByUrl, resolveSiteSpacePagePath } from '@/lib/sites';
import { trackServerInsightsEvents } from '@/lib/tracking';
import { waitUntil } from '@/lib/waitUntil';

/**
 * One tool the site's MCP server exposes.
 */
export interface SiteMcpTool<Args extends ZodRawShape = ZodRawShape> {
    name: string;
    description: string;
    /**
     * Zod shape of the tool arguments, passed as-is to `server.tool`.
     */
    inputSchema: Args;
    annotations: ToolAnnotations;
    handler: ToolCallback<Args>;
}

/**
 * Build the tools the site's MCP server exposes, for the site the request is served from.
 */
export function createSiteMcpTools(
    context: GitBookSiteContext,
    options: {
        /**
         * The MCP request being served, attached to the insights events the tools emit.
         */
        request: Request;
    }
): SiteMcpTool[] {
    const { request } = options;
    const { dataFetcher, linker, site } = context;
    const siteUrl = context.siteSpace.urls.published;

    const tools: SiteMcpTool[] = [
        defineTool({
            name: 'searchDocumentation',
            description: `Search across the documentation to find relevant information, code examples, API references, and guides. Use this tool when you need to answer questions about ${site.title}, find specific documentation, understand how features work, or locate implementation details. The search returns contextual content with titles and direct links to the documentation pages.`,
            inputSchema: {
                query: z.string(),
            },
            annotations: {
                title: 'Search documentation',
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true,
            },
            handler: async ({ query }) => {
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

                            // The search API returns sections ordered highest-score-first, so
                            // the first section with a body is the best-scoring preview.
                            const body = (pageResult.sections ?? []).find(
                                (section) => section.body
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
            },
        }),

        defineTool({
            name: 'getPage',
            description: `Fetch the full markdown content of a specific documentation page from ${site.title}. Use this when you have a page URL and want to read its content. Accepts full URLs (e.g. ${siteUrl}/getting-started). Since \`searchDocumentation\` returns partial content, use \`getPage\` to retrieve the complete page when you need more details. The content includes links you can follow to navigate to related pages.`,
            inputSchema: {
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
            annotations: {
                title: 'Get page content',
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true,
            },
            handler: async ({ url }) => {
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

                    const resolved = resolveSiteSpacePagePath(
                        match.siteSpace,
                        revision.pages,
                        match.pagePath
                    );
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
            },
        }),
    ];

    // Only expose the answer tool when the site has AI enabled, since it relies on
    // the same AI search backend that powers the site's "ask a question" experience.
    if (isAIEnabled(context.customization.ai.mode)) {
        tools.push(
            defineTool({
                name: 'askQuestion',
                description: `Ask a natural-language question about ${site.title} and get a synthesized answer, with links to the source pages. Prefer this over \`searchDocumentation\` when you want a direct answer to a question rather than a list of matching pages; use \`searchDocumentation\`/\`getPage\` when you need to browse or read full pages yourself.`,
                inputSchema: {
                    question: z
                        .string()
                        .describe(`The natural-language question to answer about ${site.title}.`),
                    goal: z
                        .string()
                        .optional()
                        .describe(
                            'The broader end goal you are ultimately trying to accomplish (as/on behalf of the user). Used to tailor the answer to be most useful for your goal. Optional.'
                        ),
                },
                annotations: {
                    title: 'Ask a question',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
                handler: async ({ question, goal }) => {
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
                },
            })
        );
    }

    tools.push(
        defineTool({
            name: 'sendFeedback',
            description: `Report an issue in the documentation of ${site.title} so the team can fix it. Use it whenever, while helping a user, you come across content that is outdated, contradictory, missing information, or otherwise unhelpful. Also use it when the user themselves reports a problem with the docs, even if you could not verify it yourself. If it's your own observation, do a quick sanity check that the issue is real before reporting — no need to exhaustively re-read the page. Send one call per distinct issue and do not report the same issue twice in a conversation. Do not use this tool to confirm that a page is accurate; it is for reporting problems only.`,
            inputSchema: {
                content: z
                    .string()
                    .min(1)
                    .max(AGENT_FEEDBACK_MAX_LENGTH)
                    .describe(agentFeedbackDescriptions.finding),
                pageUrl: z
                    .string()
                    .describe(agentFeedbackDescriptions.pageURL(siteUrl))
                    .transform((value, ctx) => {
                        const url = parseAgentFeedbackPageURL(value, siteUrl);
                        if (!url) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: `"${value}" is not a valid URL on this site. Expected a full URL like ${siteUrl}/getting-started`,
                            });
                            return z.NEVER;
                        }

                        return url;
                    }),
                goal: z
                    .string()
                    .max(AGENT_FEEDBACK_GOAL_MAX_LENGTH)
                    .optional()
                    .describe(agentFeedbackDescriptions.goal),
            },
            annotations: {
                title: 'Send feedback',
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: false,
                openWorldHint: true,
            },
            handler: async ({ content, pageUrl, goal }) => {
                try {
                    const result = await submitAgentFeedback(context, {
                        feedback: content,
                        goal,
                        page: pageUrl,
                        source: AgentFeedbackSource.Mcp,
                    });

                    if (!result.submitted) {
                        return {
                            content: [{ type: 'text', text: result.error }],
                            isError: true,
                        };
                    }

                    trackMcpEvent({
                        organizationId: context.organizationId,
                        siteId: site.id,
                        events: [
                            {
                                type: 'agent_feedback',
                                location: {
                                    displayContext: SiteInsightsDisplayContext.Mcp,
                                    page: result.page.pageId,
                                    space: result.page.spaceId,
                                    revision: result.page.revisionId,
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
            },
        })
    );

    return tools;
}

/**
 * Erase a tool's argument shape so differently-shaped tools can share one array.
 */
function defineTool<Args extends ZodRawShape>(tool: SiteMcpTool<Args>): SiteMcpTool {
    return tool as SiteMcpTool;
}

/**
 * Fire-and-forget insights tracking for the MCP endpoint. A tracking failure (e.g. a 422 from the
 * insights API) must never reject into the request lifecycle, or it surfaces as an MCP transport error.
 */
export function trackMcpEvent(args: Parameters<typeof trackServerInsightsEvents>[0]) {
    waitUntil(
        trackServerInsightsEvents(args).catch((error) => {
            console.error('Failed to track MCP insights event:', error);
        })
    );
}

/**
 * Register tools on the MCP server. Only used by the transport: the server card reads the same
 * definitions without registering anything.
 */
export function registerSiteMcpTools(server: McpServer, tools: SiteMcpTool[]) {
    for (const tool of tools) {
        server.tool(tool.name, tool.description, tool.inputSchema, tool.annotations, tool.handler);
    }
}
