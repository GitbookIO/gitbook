import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { fromPageMarkdown, toPageMarkdown } from '@/lib/markdownPage';
import {
    resolvePageId,
    resolvePagePathDocumentOrGroup,
} from '@/lib/pages';
import { findSiteSpaceBy, getFallbackSiteSpacePath } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';
import { serveMarkdown } from '@/routes/markdownPage';
import {
    SearchAIAnswer,
    type SearchAIAnswerSource,
} from '@gitbook/api';

/**
 * Serve an AI answer as markdown for a page.
 */
export async function serveAskMarkdown(
    context: GitBookSiteContext,
    { question: rawQuestion, pagePath }: {
        question: string;
        pagePath: string;
    }
) {
    return serveMarkdown(async () => {
        const question = rawQuestion.trim();

        if (!question) {
            return `Append a question to the URL in the \`?ask=<question>\` search parameter to get a complete answer and associated sources.`;
        }


        // const pageLookup = resolvePagePathDocumentOrGroup(context.revision.pages, pagePath);

        const apiClient = await context.dataFetcher.api();
        const stream = apiClient.orgs.streamAskInSite(
            context.organizationId,
            context.site.id,
            {
                question,
                context: {
                    siteSpaceId: context.siteSpace.id,
                },
                scope: {
                    mode: 'default',
                    currentSiteSpace: context.siteSpace.id,
                },
            },
            { format: 'markdown' }
        );

        let latestAnswer:SearchAIAnswer | null = null;

        for await (const chunk of stream) {
            if (chunk.type === 'answer') {
                latestAnswer = chunk.answer;
            }
        }

        if (!latestAnswer || !latestAnswer.answer || !('markdown' in latestAnswer.answer)) {
            return `We couldn't answer this question.`
        }

        const answerMarkdown = toPageMarkdown(await fromPageMarkdown(context, {
            markdown: latestAnswer.answer.markdown,
            pagePath,
        }));
        const sourcesMarkdown = await renderAskSourcesMarkdown(context, latestAnswer?.sources ?? []);

        let result = `# ${question}\n\n`;
        result += answerMarkdown.trim();
        result += '\n\n';

        if (sourcesMarkdown) {
            result += `# Sources:\n\n`;
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
                        }));
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
