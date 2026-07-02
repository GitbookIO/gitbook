import { isAIEnabled } from '@/components/utils/isAIChatEnabled';
import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { linkerWithMarkdownPages } from '@/lib/links';
import { fromPageMarkdown, toPageMarkdown } from '@/lib/markdownPage';
import { resolvePageId } from '@/lib/pages';
import { findSiteSpaceBy, getFallbackSiteSpacePath } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';
import { serveMarkdown } from '@/routes/markdownPage';
import type { SearchAIAnswer, SearchAIAnswerSource } from '@gitbook/api';

/**
 * Options to steer the AI answer served as markdown.
 */
export interface ServeAskMarkdownOptions {
    /**
     * The end goal the calling agent is trying to accomplish on behalf of the user,
     * passed via the `?goal=` search parameter. Used by the backend to steer the answer.
     */
    goal?: string;
}

/**
 * Serve an AI answer as markdown for a page.
 */
export async function serveAskMarkdown(
    context: GitBookSiteContext,
    rawQuestion: string,
    options: ServeAskMarkdownOptions = {}
) {
    if (!isAIEnabled(context.customization.ai.mode)) {
        return new Response('Not Found', { status: 404 });
    }

    return serveMarkdown(async () => {
        const question = rawQuestion.trim();
        const goal = options.goal?.trim() || undefined;

        if (
            !question ||
            // Some crawlers just follows the example URL
            question === '<question>' ||
            question === '<question'
        ) {
            return 'You forgot to pass a question in the `?ask=` parameter. Append a question to the URL in the `?ask=<question>` search parameter to get a complete answer and associated sources.';
        }

        const apiClient = await context.dataFetcher.api();
        const stream = apiClient.orgs.streamAskInSite(
            context.organizationId,
            context.site.id,
            {
                question,
                context: {
                    siteSpaceId: context.siteSpace.id,
                    goal,
                },
                scope: {
                    mode: 'default',
                    currentSiteSpace: context.siteSpace.id,
                },
            },
            { format: 'markdown' }
        );

        let latestAnswer: SearchAIAnswer | null = null;

        for await (const chunk of stream) {
            if (chunk.type === 'answer') {
                latestAnswer = chunk.answer;
            }
        }

        if (!latestAnswer || !latestAnswer.answer || !('markdown' in latestAnswer.answer)) {
            return `We couldn't answer this question.`;
        }

        const answerMarkdown = toPageMarkdown(
            await fromPageMarkdown(
                {
                    ...context,
                    linker: linkerWithMarkdownPages(context.linker),
                },
                {
                    markdown: latestAnswer.answer.markdown,
                    pagePath: '',
                }
            )
        );
        const sourcesMarkdown = await renderAskSourcesMarkdown(
            context,
            latestAnswer?.sources ?? []
        );

        let result = `# ${question}\n\n`;
        result += answerMarkdown.trim();
        result += '\n\n';

        const followupQuestions = latestAnswer.followupQuestions ?? [];
        if (followupQuestions.length > 0) {
            result += '# Suggested Follow-up Questions:\n\n';
            result +=
                'If you need more information, consider asking one of these follow-up questions by performing an HTTP GET request on the URL:\n\n';
            result += followupQuestions
                .map((q) => {
                    const base = `${context.linker.toAbsoluteURL(context.linker.toPathInSite(''))}?ask=${encodeURIComponent(q)}`;
                    // Carry the goal forward so a multi-step agent keeps its end goal across asks.
                    const url = goal ? `${base}&goal=${encodeURIComponent(goal)}` : base;
                    return `- [${q}](${url})`;
                })
                .join('\n');
            result += '\n\n';
        }

        if (sourcesMarkdown) {
            result += '# Sources:\n\n';
            result += sourcesMarkdown;
            result += '\n\n';
        }

        return result;
    });
}

async function renderAskSourcesMarkdown(
    context: GitBookSiteContext,
    sources: SearchAIAnswerSource[]
) {
    const items = (
        await Promise.all(
            sources.map(async (source) => {
                if (source.type === 'record') {
                    return {
                        title: source.title,
                        url: source.url,
                    };
                }

                const revision =
                    source.space === context.space.id && source.revision === context.revisionId
                        ? context.revision
                        : await throwIfDataError(
                              context.dataFetcher.getRevision({
                                  spaceId: source.space,
                                  revisionId: source.revision,
                              })
                          );
                const resolved = resolvePageId(revision.pages, source.page);
                if (!resolved) {
                    return null;
                }

                const found = findSiteSpaceBy(
                    context.structure,
                    (siteSpace) => siteSpace.space.id === source.space
                );
                const linker = found
                    ? context.linker.withOtherSiteSpace({
                          spaceBasePath: getFallbackSiteSpacePath(context, found.siteSpace),
                      })
                    : context.linker;

                return {
                    title: resolved.page.title,
                    url: linker.toAbsoluteURL(`${linker.toPathInSpace(resolved.page.path)}.md`),
                };
            })
        )
    ).filter(filterOutNullable);

    if (items.length === 0) {
        return '';
    }

    return items.map((item) => `- [${item.title}](${item.url})`).join('\n');
}
