'use server';

import type {
    RevisionPage,
    SearchAIAnswer,
    SearchAIRecommendedQuestionStream,
    SearchPageResult,
    SiteSpace,
    Space,
} from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import { fetchServerActionSiteContext, getServerActionBaseContext } from '@v2/lib/server-actions';
import { createStreamableValue } from 'ai/rsc';
import type * as React from 'react';

import { streamResponse } from '@/lib/actions';
import { getAbsoluteHref } from '@/lib/links';
import { resolvePageId } from '@/lib/pages';
import { findSiteSpaceById } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';
import { getV1BaseContext } from '@/lib/v1';

import { isV2 } from '@/lib/v2';
import { DocumentView } from '../DocumentView';

export type OrderedComputedResult = ComputedPageResult | ComputedSectionResult;

export interface ComputedSectionResult {
    type: 'section';
    id: string;
    title: string;
    href: string;
    body: string;
}

export interface ComputedPageResult {
    type: 'page';
    id: string;
    title: string;
    href: string;

    /** When part of a multi-spaces search, the title of the space */
    spaceTitle?: string;
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
    const context = await fetchServerActionSiteContext(
        isV2() ? await getServerActionBaseContext() : await getV1BaseContext()
    );

    return await searchSiteContent(context, {
        query,
        scope: { mode: 'all' },
    });
}

/**
 * Server action to search content in a space.
 */
export async function searchSiteSpaceContent(query: string): Promise<OrderedComputedResult[]> {
    const context = await fetchServerActionSiteContext(
        isV2() ? await getServerActionBaseContext() : await getV1BaseContext()
    );

    return await searchSiteContent(context, {
        query,
        // If we have a siteSectionId that means its a sections site use `current` mode
        // which searches in the current space + all default spaces of sections
        scope: context.sections?.current
            ? { mode: 'current', siteSpaceId: context.siteSpace.id }
            : { mode: 'specific', siteSpaceIds: [context.siteSpace.id] },
        // We want to break cache for this specific space if the revisionId is different so use it as a cache busting key
        cacheBust: context.revisionId,
    });
}

/**
 * Server action to ask a question in a space.
 */
export const streamAskQuestion = streamResponse(async function* ({
    question,
}: {
    question: string;
}) {
    const context = await fetchServerActionSiteContext(
        isV2() ? await getServerActionBaseContext() : await getV1BaseContext()
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
                // Include the current site space regardless.
                includedSiteSpaces: [context.siteSpace.id],
            },
        },
        { format: 'document' }
    );

    const spacePromises = new Map<string, Promise<RevisionPage[]>>();
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
                        context.dataFetcher.getRevisionPages({
                            spaceId: source.space,
                            revisionId: source.revision,
                            metadata: false,
                        })
                    );
                }

                return source.space;
            })
            .filter(filterOutNullable);

        // Get the pages for all spaces referenced by this answer.
        const pages = await Promise.all(
            spaces.map(async (space) => {
                const pages = await spacePromises.get(space);
                return { space, pages };
            })
        ).then((results) => {
            return results.reduce((map, result) => {
                if (result.pages) {
                    map.set(result.space, result.pages);
                }
                return map;
            }, new Map<string, RevisionPage[]>());
        });
        yield await transformAnswer(context, { answer: chunk.answer, spacePages: pages });
    }
});

/**
 * Stream a list of suggested questions for the site.
 */
export async function streamRecommendedQuestions() {
    const context = await fetchServerActionSiteContext(
        isV2() ? await getServerActionBaseContext() : await getV1BaseContext()
    );

    const stream = createStreamableValue<SearchAIRecommendedQuestionStream | undefined>();

    (async () => {
        const apiClient = await context.dataFetcher.api();
        const apiStream = apiClient.orgs.streamRecommendedQuestionsInSite(
            context.organizationId,
            context.site.id
        );

        for await (const chunk of apiStream) {
            console.log('chunk', chunk);
            stream.update(chunk);
        }
    })()
        .then(() => {
            console.log('done');
            stream.done();
        })
        .catch((error) => {
            console.log('error', error);
            stream.error(error);
        });

    return { stream: stream.value };
}

/**
 * Search for content in a site by scoping the search to all content, a specific spaces or current space.
 */
async function searchSiteContent(
    context: GitBookSiteContext,
    args: {
        query: string;
        scope:
            | { mode: 'all' }
            | { mode: 'current'; siteSpaceId: string }
            | { mode: 'specific'; siteSpaceIds: string[] };
        cacheBust?: string;
    }
): Promise<OrderedComputedResult[]> {
    const { dataFetcher, structure } = context;

    const { scope, query, cacheBust } = args;

    if (query.length <= 1) {
        return [];
    }

    const searchResults = await dataFetcher.searchSiteContent({
        organizationId: context.organizationId,
        siteId: context.site.id,
        query,
        cacheBust,
        ...scope,
    });

    return (
        await Promise.all(
            searchResults.map(async (spaceItem) => {
                const siteSpace = findSiteSpaceById(structure, spaceItem.id);

                return Promise.all(
                    spaceItem.pages.map((item) =>
                        transformSitePageResult(item, siteSpace ?? undefined)
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
                const siteSpace = findSiteSpaceById(context.structure, source.space);
                const spaceURL = siteSpace?.urls.published;

                const href = spaceURL
                    ? await getURLWithSections(page.page.path, spaceURL)
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
                        contentContext: undefined,
                        wrapBlocksInSuspense: false,
                    }}
                    style={['space-y-5']}
                />
            ) : null,
        followupQuestions: answer.followupQuestions,
        sources,
    };
}

async function transformSectionsAndPage(args: {
    item: SearchPageResult;
    space?: Space;
    spaceURL?: string;
}): Promise<[ComputedPageResult, ComputedSectionResult[]]> {
    const { item, space, spaceURL } = args;

    const sections = await Promise.all(
        item.sections?.map<Promise<ComputedSectionResult>>(async (section) => ({
            type: 'section',
            id: `${item.id}/${section.id}`,
            title: section.title,
            href: await getURLWithSections(section.path, spaceURL),
            body: section.body,
        })) ?? []
    );

    const page: ComputedPageResult = {
        type: 'page',
        id: item.id,
        title: item.title,
        href: await getURLWithSections(item.path, spaceURL),
        spaceTitle: space?.title,
    };

    return [page, sections];
}

async function transformSitePageResult(item: SearchPageResult, siteSpace?: SiteSpace) {
    const [page, sections] = await transformSectionsAndPage({
        item,
        space: siteSpace?.space,
        spaceURL: siteSpace?.urls.published,
    });

    return [page, ...sections];
}

// Resolve a relative path to an absolute URL
// if the search result is relative to another space, we use the space URL
async function getURLWithSections(path: string, spaceURL?: string) {
    if (spaceURL) {
        if (!spaceURL.endsWith('/')) {
            spaceURL += '/';
        }
        if (path.startsWith('/')) {
            path = path.slice(1);
        }
        return spaceURL + path;
    }
    return getAbsoluteHref(path);
}
