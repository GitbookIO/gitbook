'use server';

import {
    Collection,
    RevisionPage,
    SearchAIAnswer,
    SearchPageResult,
    Site,
    SiteSpace,
    Space,
} from '@gitbook/api';

import { streamResponse } from '@/lib/actions';
import * as api from '@/lib/api';
import { absoluteHref, pageHref } from '@/lib/links';
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
    body?: React.ReactNode;
    followupQuestions: string[];
    sources: AskAnswerSource[];
    hasAnswer: boolean;
}

/**
 * Search for content in the entire site.
 */
export async function searchSiteContent(args: {
    pointer: api.SiteContentPointer;
    query: string;
    siteSpaceIds?: string[];
    cacheBust?: string;
}): Promise<OrderedComputedResult[]> {
    const { pointer, siteSpaceIds, query, cacheBust } = args;

    if (query.length <= 1) {
        return [];
    }

    if (siteSpaceIds?.length === 0) {
        // if we have no siteSpaces to search in then we won't find anything. skip the call.
        return [];
    }

    if (!('siteId' in pointer)) {
        throw new Error(`Expected a site pointer for searching site content`);
    }

    const [searchResults, allSiteSpaces] = await Promise.all([
        api.searchSiteContent(
            pointer.organizationId,
            pointer.siteId,
            query,
            siteSpaceIds,
            cacheBust,
        ),
        siteSpaceIds
            ? null
            : api.getSiteSpaces({
                  organizationId: pointer.organizationId,
                  siteId: pointer.siteId,
                  siteShareKey: pointer.siteShareKey,
              }),
    ]);

    if (!siteSpaceIds) {
        // We are searching all of this Site's content
        return searchResults.items
            .map((spaceItem) => {
                const siteSpace = allSiteSpaces?.find(
                    (siteSpace) => siteSpace.space.id === spaceItem.id,
                );

                return spaceItem.pages.map((item) => transformSitePageResult(item, siteSpace));
            })
            .flat(2);
    }

    return searchResults.items
        .map((spaceItem) => {
            return spaceItem.pages.map((item) => transformPageResult(item));
        })
        .flat(2);
}

/**
 * Server action to search content in the current space
 */
export async function searchCurrentSpaceContent(
    query: string,
    pointer: api.SiteContentPointer,
    revisionId: string,
): Promise<OrderedComputedResult[]> {
    const siteSpaceIds = pointer.siteSpaceId ? [pointer.siteSpaceId] : []; // if we don't have a siteSpaceID search all content

    // This is a site so use a different function which we can eventually call directly
    // We also want to break cache for this specific space if the revisionId is different so use it as a cache busting key
    return await searchSiteContent({
        pointer,
        siteSpaceIds,
        query,
        cacheBust: revisionId,
    });

    // This is for legacy space content pointer and it should not be used anymore
    const data = await api.searchSpaceContent(pointer.spaceId, revisionId, query);
    return data.items.map((item) => transformPageResult(item, undefined)).flat();
}

/**
 * Server action to ask a question in a space.
 */
export const streamAskQuestion = streamResponse(async function* (spaceId: string, query: string) {
    const stream = api
        .api()
        .spaces.streamAskInSpace(spaceId, { query, format: 'document', details: true });
    const pagesPromise = api.getSpaceContentData({ spaceId }, undefined);

    for await (const chunk of stream) {
        // We run the AI search and fetch the pages in parallel
        const { pages } = await pagesPromise;

        yield transformAnswer(chunk.answer, pages);
    }
});

/**
 * List suggested questions for a space.
 */
export async function getRecommendedQuestions(spaceId: string): Promise<string[]> {
    const data = await api.getRecommendedQuestionsInSpace(spaceId);
    return data.questions;
}

function transformAnswer(
    answer: SearchAIAnswer | undefined,
    pages: RevisionPage[],
): AskAnswerResult | null {
    if (!answer) {
        return null;
    }

    const sources = answer.sources
        .map((source) => {
            if (source.type !== 'page') {
                return null;
            }

            const page = resolvePageId(pages, source.page);
            if (!page) {
                return null;
            }

            return {
                id: page.page.id,
                title: page.page.title,
                href: pageHref(pages, page.page),
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
                        shouldHighlightCode: () => false,
                    }}
                    style={['space-y-5']}
                />
            ) : null,
        followupQuestions: answer.followupQuestions,
        sources,
        hasAnswer: !!answer.answer && 'document' in answer.answer,
    };
}

function transformSectionsAndPage(args: {
    item: SearchPageResult;
    space?: Space;
    spaceURL?: string;
}): [ComputedPageResult, ComputedSectionResult[]] {
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
            return absoluteHref(path);
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

function transformSitePageResult(item: SearchPageResult, siteSpace?: SiteSpace) {
    const [page, sections] = transformSectionsAndPage({
        item,
        space: siteSpace?.space,
        spaceURL: siteSpace?.urls.published,
    });

    return [page, ...sections];
}

function transformPageResult(item: SearchPageResult, space?: Space) {
    const [page, sections] = transformSectionsAndPage({
        item,
        space,
        spaceURL: space?.urls.published ?? space?.urls.app,
    });

    return [page, ...sections];
}
