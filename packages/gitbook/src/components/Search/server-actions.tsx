'use server';

import { RevisionPage, SearchAIAnswer, SearchPageResult, SiteSpace, Space } from '@gitbook/api';
import { captureException } from '@sentry/nextjs';
import * as React from 'react';
import { assert } from 'ts-essentials';

import { streamResponse } from '@/lib/actions';
import * as api from '@/lib/api';
import { GitBookContext } from '@/lib/gitbook-context';
import { getAbsoluteHref, getPageHref } from '@/lib/links';
import { resolvePageId } from '@/lib/pages';
import { filterOutNullable } from '@/lib/typescript';

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
async function searchSiteContent(
    ctx: GitBookContext,
    args: {
        pointer: api.SiteContentPointer;
        query: string;
        scope:
            | { mode: 'all' }
            | { mode: 'current'; siteSpaceId: string }
            | { mode: 'specific'; siteSpaceIds: string[] };
        cacheBust?: string;
    },
): Promise<OrderedComputedResult[]> {
    const { pointer, scope, query, cacheBust } = args;

    if (query.length <= 1) {
        return [];
    }

    const needsStructure =
        scope.mode === 'all' ||
        scope.mode === 'current' ||
        (scope.mode === 'specific' && scope.siteSpaceIds.length > 1);

    const [searchResults, siteData] = await Promise.all([
        api.searchSiteContent(ctx, pointer.organizationId, pointer.siteId, query, scope, cacheBust),
        needsStructure ? api.getSiteData(ctx, pointer) : null,
    ]);
    const siteStructure = siteData?.structure;

    const siteSpaces = siteStructure
        ? siteStructure.type === 'siteSpaces'
            ? siteStructure.structure
            : siteStructure.structure.reduce<SiteSpace[]>((prev, section) => {
                  const sectionSiteSpaces = section.siteSpaces.map((siteSpace) => ({
                      ...siteSpace,
                      space: {
                          ...siteSpace.space,
                          title: section.title || siteSpace.space.title,
                      },
                  }));

                  prev.push(...sectionSiteSpaces);
                  return prev;
              }, [])
        : null;

    if (siteSpaces) {
        // We are searching all of this Site's content
        return searchResults.items
            .map((spaceItem) => {
                const siteSpace = siteSpaces.find(
                    (siteSpace) => siteSpace.space.id === spaceItem.id,
                );

                return spaceItem.pages.map((item) => transformSitePageResult(ctx, item, siteSpace));
            })
            .flat(2);
    }

    return searchResults.items
        .map((spaceItem) => spaceItem.pages.map((item) => transformPageResult(ctx, item)))
        .flat(2);
}

/**
 * Server action to search content in the entire site.
 */
export async function searchAllSiteContent(
    ctx: GitBookContext,
    query: string,
    pointer: api.SiteContentPointer,
): Promise<OrderedComputedResult[]> {
    return await searchSiteContent(ctx, {
        pointer,
        query,
        scope: { mode: 'all' },
    });
}

/**
 * Server action to search content in a space.
 */
export async function searchSiteSpaceContent(
    ctx: GitBookContext,
    query: string,
    pointer: api.SiteContentPointer,
    revisionId: string,
): Promise<OrderedComputedResult[]> {
    const siteSpaceId = pointer.siteSpaceId;
    assert(siteSpaceId, 'Expected siteSpaceId for searchSiteSpaceContent');
    console.log(`server actions loaded with ${process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY}`);

    return await searchSiteContent(ctx, {
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
export const streamAskQuestion = streamResponse(async function* (
    ctx: GitBookContext,
    organizationId: string,
    siteId: string,
    siteSpaceId: string | null,
    question: string,
) {
    const stream = api.api(ctx).client.orgs.streamAskInSite(
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
        { format: 'document' },
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
                        api.getRevisionPages(ctx, source.space, source.revision, {
                            metadata: false,
                        }),
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
            }),
        ).then((results) => {
            return results.reduce((map, result) => {
                if (result.pages) {
                    map.set(result.space, result.pages);
                }
                return map;
            }, new Map<string, RevisionPage[]>());
        });
        yield transformAnswer(ctx, chunk.answer, pages);
    }
});

/**
 * List suggested questions for a space.
 */
export async function getRecommendedQuestions(
    ctx: GitBookContext,
    spaceId: string,
): Promise<string[]> {
    const data = await api.getRecommendedQuestionsInSpace(ctx, spaceId);
    if (!data.questions) {
        captureException(new Error('Expected questions in getRecommendedQuestions'), {
            extra: { data },
        });
        return [];
    }
    return data.questions;
}

function transformAnswer(
    ctx: GitBookContext,
    answer: SearchAIAnswer,
    spacePages: Map<string, RevisionPage[]>,
): AskAnswerResult {
    const sources = answer.sources
        .map((source) => {
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

            return {
                id: source.page,
                title: page.page.title,
                href: getPageHref(ctx, pages, page.page),
            };
        })
        .filter(filterOutNullable);

    return {
        body:
            answer.answer && 'document' in answer.answer ? (
                <DocumentView
                    document={answer.answer.document}
                    context={{
                        mode: 'default',
                        contentRefContext: null,
                        resolveContentRef: async () => null,
                        wrapBlocksInSuspense: false,
                    }}
                    style={['space-y-5']}
                />
            ) : null,
        followupQuestions: answer.followupQuestions,
        sources,
    };
}

function transformSectionsAndPage(
    ctx: GitBookContext,
    args: {
        item: SearchPageResult;
        space?: Space;
        spaceURL?: string;
    },
): [ComputedPageResult, ComputedSectionResult[]] {
    const { item, space, spaceURL } = args;

    // Resolve a relative path to an absolute URL
    // if the search result is relative to another space, we use the space URL
    const getURL = (path: string, spaceURL?: string) => {
        if (spaceURL) {
            if (!spaceURL.endsWith('/')) {
                spaceURL += '/';
            }
            if (path.startsWith('/')) {
                path = path.slice(1);
            }
            return spaceURL + path;
        } else {
            return getAbsoluteHref(ctx, path);
        }
    };

    const sections =
        item.sections?.map<ComputedSectionResult>((section) => ({
            type: 'section',
            id: item.id + '/' + section.id,
            title: section.title,
            href: getURL(section.path, spaceURL),
            body: section.body,
        })) ?? [];

    const page: ComputedPageResult = {
        type: 'page',
        id: item.id,
        title: item.title,
        href: getURL(item.path, spaceURL),
        spaceTitle: space?.title,
    };

    return [page, sections];
}

function transformSitePageResult(
    ctx: GitBookContext,
    item: SearchPageResult,
    siteSpace?: SiteSpace,
) {
    const [page, sections] = transformSectionsAndPage(ctx, {
        item,
        space: siteSpace?.space,
        spaceURL: siteSpace?.urls.published,
    });

    return [page, ...sections];
}

function transformPageResult(ctx: GitBookContext, item: SearchPageResult, space?: Space) {
    const [page, sections] = transformSectionsAndPage(ctx, {
        item,
        space,
        spaceURL: space?.urls.published ?? space?.urls.app,
    });

    return [page, ...sections];
}
