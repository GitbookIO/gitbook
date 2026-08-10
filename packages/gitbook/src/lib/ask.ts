import type { GitBookSiteContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { resolvePageId } from '@/lib/pages';
import { findSiteSpaceBy, getFallbackSiteSpacePath } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';
import type { SearchAIAnswer, SearchAIAnswerSource } from '@gitbook/api';

/**
 * Options to steer a site AI answer.
 */
export interface StreamSiteAskOptions {
    /**
     * The end goal the calling agent is trying to accomplish on behalf of the user.
     * Used by the backend to steer the answer.
     */
    goal?: string;
}

/**
 * Ask a natural-language question against a site's AI search backend and return the
 * final answer once the stream completes.
 *
 * This is the single entry point both the `?ask=` markdown route and the site MCP
 * `askQuestion` tool go through, so they answer questions from the exact same backend
 * (`streamAskInSite`) rather than reimplementing retrieval.
 */
export async function streamSiteAskAnswer(
    context: GitBookSiteContext,
    question: string,
    options: StreamSiteAskOptions = {}
): Promise<SearchAIAnswer | null> {
    const apiClient = await context.dataFetcher.api();
    const stream = apiClient.orgs.streamAskInSite(
        context.organizationId,
        context.site.id,
        {
            question,
            context: {
                siteSpaceId: context.siteSpace.id,
                goal: options.goal,
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

    return latestAnswer;
}

/**
 * Render the sources of an AI answer as a markdown list of links.
 *
 * @param options.markdownLinks when true, page links point at the `.md` variant of each
 * page (for the crawler-facing `?ask=` markdown route); when false they point at the
 * regular published page URLs (for the MCP tool, so the URLs can be fed back into `getPage`).
 */
export async function renderAskSourcesMarkdown(
    context: GitBookSiteContext,
    sources: SearchAIAnswerSource[],
    options: { markdownLinks?: boolean } = {}
): Promise<string> {
    const { markdownLinks = false } = options;

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

                const path = linker.toPathInSpace(resolved.page.path);

                return {
                    title: resolved.page.title,
                    url: linker.toAbsoluteURL(markdownLinks ? `${path}.md` : path),
                };
            })
        )
    ).filter(filterOutNullable);

    if (items.length === 0) {
        return '';
    }

    return items.map((item) => `- [${item.title}](${item.url})`).join('\n');
}
