'use server';

import type {
    RevisionPage,
    SearchAIAnswer,
    SearchPageResult,
    SiteSpace,
    Space,
} from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
import type * as React from 'react';
import { assert } from 'ts-essentials';

import { streamResponse } from '@/lib/actions';
import * as api from '@/lib/api';
import { getAbsoluteHref } from '@/lib/links';
import { resolvePageId } from '@/lib/pages';
import { findSiteSpaceById } from '@/lib/sites';
import { filterOutNullable } from '@/lib/typescript';
import { fetchV1ContextForSitePointer } from '@/lib/v1';

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
 * Search for content in a site by scoping the search to all content, a specific spaces or current space.
 */
async function searchSiteContent(args: {
    pointer: api.SiteContentPointer;
    query: string;
    scope:
        | { mode: 'all' }
        | { mode: 'current'; siteSpaceId: string }
        | { mode: 'specific'; siteSpaceIds: string[] };
    cacheBust?: string;
}): Promise<OrderedComputedResult[]> {
    const { pointer, scope, query, cacheBust } = args;

    if (query.length <= 1) {
        return [];
    }

    const needsStructure =
        scope.mode === 'all' ||
        scope.mode === 'current' ||
        (scope.mode === 'specific' && scope.siteSpaceIds.length > 1);

    const [searchResults, siteData] = await Promise.all([
        api.searchSiteContent(pointer.organizationId, pointer.siteId, query, scope, cacheBust),
        needsStructure ? fetchV1ContextForSitePointer(pointer) : null,
    ]);
    const siteStructure = siteData?.structure;

    if (siteStructure) {
        // We are searching all of this Site's content
        return (
            await Promise.all(
                searchResults.items.map(async (spaceItem) => {
                    const siteSpace = findSiteSpaceById(siteStructure, spaceItem.id);

                    return Promise.all(
                        spaceItem.pages.map((item) =>
                            transformSitePageResult(item, siteSpace ?? undefined)
                        )
                    );
                })
            )
        ).flat(2);
    }

    return (
        await Promise.all(
            searchResults.items.map((spaceItem) => {
                return Promise.all(spaceItem.pages.map((item) => transformPageResult(item)));
            })
        )
    ).flat(2);
}

/**
 * Server action to search content in the entire site.
 */
export async function searchAllSiteContent(
    query: string,
    pointer: api.SiteContentPointer
): Promise<OrderedComputedResult[]> {
    return await searchSiteContent({
        pointer,
        query,
        scope: { mode: 'all' },
    });
}

/**
 * Server action to search content in a space.
 */
export async function searchSiteSpaceContent(
    query: string,
    pointer: api.SiteContentPointer,
    revisionId: string
): Promise<OrderedComputedResult[]> {
    const siteSpaceId = pointer.siteSpaceId;
    assert(siteSpaceId, 'Expected siteSpaceId for searchSiteSpaceContent');

    return await searchSiteContent({
        pointer,
        query,
        // If we have a siteSectionId that means its a sections site use `current` mode
        // which searches in the current space + all default spaces of sections
        scope: pointer.siteSectionId
            ? { mode: 'current', siteSpaceId }
            : { mode: 'specific', siteSpaceIds: [siteSpaceId] },
        // We want to break cache for this specific space if the revisionId is different so use it as a cache busting key
        cacheBust: revisionId,
    });
}

/**
 * Server action to ask a question in a space.
 */
export const streamAskQuestion = streamResponse(async function* ({
    pointer,
    question,
}: {
    pointer: api.SiteContentPointer;
    question: string;
}) {
    const { organizationId, siteId, siteSpaceId } = pointer;
    const [apiCtx, context] = await Promise.all([api.api(), fetchV1ContextForSitePointer(pointer)]);

    const stream = apiCtx.client.orgs.streamAskInSite(
        organizationId,
        siteId,
        {
            question,
            context: siteSpaceId
                ? {
                      siteSpaceId,
                  }
                : undefined,
            scope: {
                mode: 'default',

                // Include the current site space regardless.
                includedSiteSpaces: siteSpaceId ? [siteSpaceId] : undefined,
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
export const streamRecommendedQuestions = streamResponse(async function* (
    organizationId: string,
    siteId: string
) {
    const apiCtx = await api.api();
    const stream = apiCtx.client.orgs.streamRecommendedQuestionsInSite(organizationId, siteId);

    for await (const chunk of stream) {
        yield chunk;
    }
});

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

async function transformPageResult(item: SearchPageResult, space?: Space) {
    const [page, sections] = await transformSectionsAndPage({
        item,
        space,
        spaceURL: space?.urls.published ?? space?.urls.app,
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
