'use server';

import type { GitBookBaseContext, GitBookSiteContext } from '@/lib/context';
import { resolvePageId } from '@/lib/pages';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@/lib/server-actions';
import { findSiteSpaceBy } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';
import type {
    Revision,
    RevisionPage,
    SearchAIAnswer,
    SearchAIRecommendedQuestionStream,
    SearchPageResult,
    SearchSpaceResult,
    SiteSection,
    SiteSectionGroup,
    SiteSpace,
    Space,
} from '@gitbook/api';
import { createStreamableValue } from 'ai/rsc';
import type * as React from 'react';

import { throwIfDataError } from '@/lib/data';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { joinPathWithBaseURL } from '@/lib/paths';
import { traceErrorOnly } from '@/lib/tracing';
import type { IconName } from '@gitbook/icons';
import { DocumentView } from '../DocumentView';

export type OrderedComputedResult = ComputedPageResult | ComputedSectionResult;

export interface ComputedSectionResult {
    type: 'section';
    id: string;
    title: string;
    body: string;
    href: string;

    pageId: string;
    spaceId: string;
}

export interface ComputedPageResult {
    type: 'page';
    id: string;
    title: string;

    href: string;

    pageId: string;
    spaceId: string;

    breadcrumbs?: Array<{ icon?: IconName; label: string }>;
}

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
 * Server action to search content in the entire site.
 */
export async function searchAllSiteContent(query: string): Promise<OrderedComputedResult[]> {
    return traceErrorOnly('Search.searchAllSiteContent', async () => {
        const context = await getServerActionBaseContext();
        return searchSiteContent(context, {
            query,
            scope: { mode: 'all' },
        });
    });
}

/**
 * Server action to search content in a space.
 */
export async function searchCurrentSiteSpaceContent(
    query: string,
    siteSpaceId: string
): Promise<OrderedComputedResult[]> {
    return traceErrorOnly('Search.searchSiteSpaceContent', async () => {
        const context = await getServerActionBaseContext();

        return await searchSiteContent(context, {
            query,
            scope: { mode: 'current', siteSpaceId },
        });
    });
}

/**
 * Server action to search content in a specific space.
 */
export async function searchSpecificSiteSpaceContent(
    query: string,
    siteSpaceIds: string[]
): Promise<OrderedComputedResult[]> {
    return traceErrorOnly('Search.searchSiteSpaceContent', async () => {
        const context = await getServerActionBaseContext();

        return await searchSiteContent(context, {
            query,
            scope: { mode: 'specific', siteSpaceIds },
        });
    });
}

/**
 * Server action to ask a question in a space.
 */
export async function streamAskQuestion({
    question,
}: {
    question: string;
}) {
    return traceErrorOnly('Search.streamAskQuestion', async () => {
        const responseStream = createStreamableValue<AskAnswerResult | undefined>();

        (async () => {
            const context = await fetchServerActionSiteContext(await getServerActionBaseContext());

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
                    await transformAnswer(context, { answer: chunk.answer, spacePages: pages })
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

/**
 * Search for content in a site by scoping the search to all content, a specific spaces or current space.
 */
async function searchSiteContent(
    context: GitBookBaseContext,
    args: {
        query: string;
        scope:
            | { mode: 'all' }
            | { mode: 'current'; siteSpaceId: string }
            | { mode: 'specific'; siteSpaceIds: string[] };
    }
): Promise<OrderedComputedResult[]> {
    const { dataFetcher } = context;
    const siteURLData = await getSiteURLDataFromMiddleware();

    const { scope, query } = args;

    if (query.length <= 1) {
        return [];
    }

    const [searchResults, { structure }] = await Promise.all([
        throwIfDataError(
            dataFetcher.searchSiteContent({
                organizationId: siteURLData.organization,
                siteId: siteURLData.site,
                query,
                scope,
            })
        ),
        throwIfDataError(
            dataFetcher.getPublishedContentSite({
                organizationId: siteURLData.organization,
                siteId: siteURLData.site,
                siteShareKey: siteURLData.shareKey,
            })
        ),
    ]);

    return (
        await Promise.all(
            searchResults.map((spaceItem) => {
                const found = findSiteSpaceBy(
                    structure,
                    (siteSpace) => siteSpace.space.id === spaceItem.id
                );
                const siteSection = found?.siteSection;
                const siteSectionGroup = found?.siteSectionGroup;

                return Promise.all(
                    spaceItem.pages.map((pageItem) =>
                        transformSitePageResult(context, {
                            pageItem,
                            spaceItem,
                            siteSpace: found?.siteSpace,
                            space: found?.siteSpace.space,
                            spaceURL: found?.siteSpace.urls.published,
                            siteSection: siteSection ?? undefined,
                            siteSectionGroup: (siteSectionGroup as SiteSectionGroup) ?? undefined,
                        })
                    )
                );
            })
        )
    ).flat(2);
}

async function transformAnswer(
    context: GitBookSiteContext,
    {
        answer,
        spacePages,
    }: {
        answer: SearchAIAnswer;
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

                const href = spaceURL
                    ? joinPathWithBaseURL(spaceURL, page.page.path)
                    : context.linker.toPathForPage({
                          pages,
                          page: page.page,
                      });

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
                    style={['space-y-5']}
                />
            ) : null,
        followupQuestions: answer.followupQuestions,
        sources,
    };
}

async function transformSitePageResult(
    context: GitBookBaseContext,
    args: {
        pageItem: SearchPageResult;
        spaceItem: SearchSpaceResult;
        space?: Space;
        siteSpace?: SiteSpace;
        spaceURL?: string;
        siteSection?: SiteSection;
        siteSectionGroup?: SiteSectionGroup;
    }
): Promise<OrderedComputedResult[]> {
    const { pageItem, spaceItem, spaceURL, siteSection, siteSectionGroup, siteSpace } = args;
    const { linker } = context;

    const page: ComputedPageResult = {
        type: 'page',
        id: `${spaceItem.id}/${pageItem.id}`,
        title: pageItem.title,
        href: spaceURL
            ? linker.toLinkForContent(joinPathWithBaseURL(spaceURL, pageItem.path))
            : linker.toPathInSpace(pageItem.path),
        pageId: pageItem.id,
        spaceId: spaceItem.id,
        breadcrumbs: [
            siteSectionGroup && {
                icon: siteSectionGroup?.icon as IconName,
                label: siteSectionGroup.title,
            },
            siteSection && {
                icon: siteSection?.icon as IconName,
                label: siteSection.title,
            },
            (!siteSection || siteSection?.siteSpaces.length > 1) && siteSpace
                ? {
                      label: siteSpace.title,
                  }
                : undefined,
        ].filter((item) => item !== undefined),
    };

    const pageSections = await Promise.all(
        pageItem.sections?.map<Promise<ComputedSectionResult>>(async (section) => ({
            type: 'section',
            id: `${page.id}/${section.id}`,
            title: section.title,
            href: spaceURL
                ? linker.toLinkForContent(joinPathWithBaseURL(spaceURL, section.path))
                : linker.toPathInSpace(pageItem.path),
            body: section.body,
            pageId: pageItem.id,
            spaceId: spaceItem.id,
        })) ?? []
    );

    return [page, ...pageSections];
}
