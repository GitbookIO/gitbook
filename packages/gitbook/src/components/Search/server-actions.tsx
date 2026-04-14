'use server';

import type { GitBookSiteContext } from '@/lib/context';
import { resolvePageId } from '@/lib/pages';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
import { findSiteSpaceBy } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';
import type {
    Revision,
    RevisionPage,
    SearchAIAnswer,
    SearchAIRecommendedQuestionStream,
} from '@gitbook/api';
import { createStreamableValue } from 'ai/rsc';
import type * as React from 'react';

import { throwIfDataError } from '@/lib/data';
import { toEmbeddableLinkForPublishedContent } from '@/lib/embeddable-linker';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { joinPathWithBaseURL } from '@/lib/paths';
import { traceErrorOnly } from '@/lib/tracing';
import { DocumentView } from '../DocumentView';

export interface AskAnswerSource {
    id: string;
    title: string;
    href: string;
}

export interface AskAnswerResult {
    /** Undefined if no answer. */
    body?: React.ReactNode;
    followupQuestions: string[];
    sources: AskAnswerSource[];
}

/**
 * Server action to ask a question in a space.
 */
export async function streamAskQuestion({
    asEmbeddable,
    question,
}: {
    asEmbeddable?: boolean;
    question: string;
}) {
    return traceErrorOnly('Search.streamAskQuestion', async () => {
        const responseStream = createStreamableValue<AskAnswerResult | undefined>();

        (async () => {
            const context = await fetchServerActionSiteContext(
                await getServerActionBaseContext({ isEmbeddable: asEmbeddable })
            );

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
                { format: 'document' }
            );

            const spacePromises = new Map<string, Promise<Revision>>();
            for await (const chunk of stream) {
                const answer = chunk.answer;

                // Register the space of each page source into the promise queue.
                const spaces = answer.sources
                    .map((source) => {
                        if (source.type !== 'page') {
                            return null;
                        }

                        if (!spacePromises.has(source.space)) {
                            spacePromises.set(
                                source.space,
                                throwIfDataError(
                                    context.dataFetcher.getRevision({
                                        spaceId: source.space,
                                        revisionId: source.revision,
                                    })
                                )
                            );
                        }

                        return source.space;
                    })
                    .filter(filterOutNullable);

                // Get the pages for all spaces referenced by this answer.
                const pages = await Promise.all(
                    spaces.map(async (space) => {
                        const revision = await spacePromises.get(space);
                        return { space, pages: revision?.pages };
                    })
                ).then((results) => {
                    return results.reduce((map, result) => {
                        if (result.pages) {
                            map.set(result.space, result.pages);
                        }
                        return map;
                    }, new Map<string, RevisionPage[]>());
                });
                responseStream.update(
                    await transformAnswer(context, {
                        answer: chunk.answer,
                        asEmbeddable: Boolean(asEmbeddable),
                        spacePages: pages,
                    })
                );
            }
        })()
            .then(() => {
                responseStream.done();
            })
            .catch((error) => {
                responseStream.error(error);
            });

        return {
            stream: responseStream.value,
        };
    });
}

/**
 * Stream a list of suggested questions for the site.
 * Optionally scoped to a specific space.
 */
export async function streamRecommendedQuestions(args: { siteSpaceId?: string }) {
    return traceErrorOnly('Search.streamRecommendedQuestions', async () => {
        const siteURLData = await getSiteURLDataFromMiddleware();
        const context = await getServerActionBaseContext();

        const responseStream = createStreamableValue<
            SearchAIRecommendedQuestionStream | undefined
        >();

        (async () => {
            const apiClient = await context.dataFetcher.api();
            const apiStream = apiClient.orgs.streamRecommendedQuestionsInSite(
                siteURLData.organization,
                siteURLData.site,
                {
                    siteSpaceId: args.siteSpaceId,
                }
            );

            for await (const chunk of apiStream) {
                responseStream.update(chunk);
            }
        })()
            .then(() => {
                responseStream.done();
            })
            .catch((error) => {
                responseStream.error(error);
            });

        return { stream: responseStream.value };
    });
}

async function transformAnswer(
    context: GitBookSiteContext,
    {
        answer,
        asEmbeddable,
        spacePages,
    }: {
        answer: SearchAIAnswer;
        asEmbeddable: boolean;
        spacePages: Map<string, RevisionPage[]>;
    }
): Promise<AskAnswerResult> {
    const sources = (
        await Promise.all(
            answer.sources.map(async (source) => {
                if (source.type !== 'page') {
                    return null;
                }

                const pages = spacePages.get(source.space);

                if (!pages) {
                    return null;
                }

                const page = resolvePageId(pages, source.page);
                if (!page) {
                    return null;
                }

                // Find the siteSpace in case it is nested in a site section so we can resolve the URL appropriately
                const found = findSiteSpaceBy(
                    context.structure,
                    (siteSpace) => siteSpace.space.id === source.space
                );
                const spaceURL = found?.siteSpace.urls.published;

                let href = context.linker.toPathForPage({
                    pages,
                    page: page.page,
                });

                if (spaceURL) {
                    if (asEmbeddable) {
                        href = toEmbeddableLinkForPublishedContent(
                            context.linker,
                            spaceURL,
                            page.page.path
                        );
                    } else {
                        href = context.linker.toLinkForContent(
                            joinPathWithBaseURL(spaceURL, page.page.path)
                        );
                    }
                }

                return {
                    id: source.page,
                    title: page.page.title,
                    href,
                };
            })
        )
    ).filter(filterOutNullable);

    return {
        body:
            answer.answer && 'document' in answer.answer ? (
                <DocumentView
                    document={answer.answer.document}
                    context={{
                        mode: 'default',
                        contentContext: context,
                        wrapBlocksInSuspense: false,
                        withLinkPreviews: false, // We don't want to render link previews in the AI answer.
                    }}
                    style="space-y-5 *:origin-top-left *:animate-blur-in-slow"
                />
            ) : null,
        followupQuestions: answer.followupQuestions,
        sources,
    };
}
