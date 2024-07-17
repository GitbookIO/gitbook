'use server';

import {
    Collection,
    RevisionPage,
    SearchAIAnswer,
    SearchPageResult,
    Site,
    Space,
} from '@gitbook/api';

import { getContentPointer } from '@/app/(space)/fetch';
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

export async function searchSiteContent(args: {
    query: string;
    siteSpaceIds?: string[];
    cacheBust?: string;
}): Promise<OrderedComputedResult[]> {
    const { siteSpaceIds = [], query, cacheBust } = args;
    const pointer = getContentPointer();

    if ('siteId' in pointer && 'organizationId' in pointer) {
        const searchResults = await api.searchSiteContent(
            pointer.organizationId,
            pointer.siteId,
            query,
            siteSpaceIds,
            cacheBust,
        );

        // resolve all SiteSpaces so we can match up with the spaceId
        const allSiteSpaces = await api.getSiteSpaces({
            organizationId: pointer.organizationId,
            siteId: pointer.siteId,
            siteShareKey: pointer.siteShareKey,
        });

        if (siteSpaceIds.length === 0) {
            // We are searching all of this Site's content

            const processedSiteSpaces = allSiteSpaces.map((siteSpace) => {
                // replace the published url for the "space" with the site's published url
                siteSpace.space.urls.published = siteSpace.urls.published;
                return siteSpace;
            });

            // We pass a space to the transform since this search is relative to the Site
            return searchResults.items
                .map((spaceItem) => {
                    const siteSpace = processedSiteSpaces.find(
                        (siteSpace) => siteSpace.space.id === spaceItem.id,
                    );

                    return spaceItem.pages.map((item) =>
                        transformPageResult(item, siteSpace?.space),
                    );
                })
                .flat(2);
        }

        return searchResults.items
            .map((spaceItem) => {
                return spaceItem.pages.map((item) => transformPageResult(item));
            })
            .flat(2);
    }

    // This should never happen
    return [];
}

/**
 * Server action to search content in a space
 */
export async function searchSpaceContent(
    spaceId: string,
    revisionId: string,
    query: string,
): Promise<OrderedComputedResult[]> {
    const pointer = getContentPointer();

    if ('siteId' in pointer && 'organizationId' in pointer) {
        const siteSpaceIds = pointer.siteSpaceId ? [pointer.siteSpaceId] : []; // if we don't have a siteSpaceID search all content

        // This is a site so use a different function which we can eventually call directly
        // We also want to break cache for this specific space if the revisionId is different so use it as a cache busting key
        return await searchSiteContent({ siteSpaceIds, query, cacheBust: revisionId });
    }

    const data = await api.searchSpaceContent(spaceId, revisionId, query);
    return data.items.map((item) => transformPageResult(item, undefined)).flat();
}

/**
 * Server action to search content in a parent (site or collection)
 */
export async function searchParentContent(
    parent: Site | Collection,
    query: string,
): Promise<OrderedComputedResult[]> {
    const pointer = getContentPointer();
    const isSite = 'siteId' in pointer;

    if (isSite) {
        return searchSiteContent({ query });
    }

    const [data, collectionSpaces] = await Promise.all([
        api.searchParentContent(parent.id, query),
        parent.object === 'collection' ? api.getCollectionSpaces(parent.id) : null,
    ]);

    let spaces: Space[] = collectionSpaces ? collectionSpaces : [];

    return data.items
        .map((spaceItem) => {
            const space = spaces.find((space) => space.id === spaceItem.id);
            return spaceItem.pages.map((item) => transformPageResult(item, space));
        })
        .flat(2);
}

/**
 * Server action to ask a question in a space.
 */
export const streamAskQuestion = streamResponse(async function* (spaceId: string, query: string) {
    const stream = api
        .api()
        .spaces.streamAskInSpace(spaceId, { query, format: 'document', details: true });
    const pagesPromise = api.getSpaceContentData({ spaceId });

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

function transformPageResult(item: SearchPageResult, space?: Space) {
    // Resolve a relative path to an absolute URL
    // if the search result is relative to another space, we use the space URL
    const getURL = (path: string) => {
        if (space) {
            let url = space.urls.published ?? space.urls.app;
            if (!url.endsWith('/')) {
                url += '/';
            }
            if (path.startsWith('/')) {
                path = path.slice(1);
            }
            return url + path;
        } else {
            return absoluteHref(path);
        }
    };

    const sections =
        item.sections?.map<ComputedSectionResult>((section) => ({
            type: 'section',
            id: item.id + '/' + section.id,
            title: section.title,
            href: getURL(section.path),
            body: section.body,
        })) ?? [];

    const page: ComputedPageResult = {
        type: 'page',
        id: item.id,
        title: item.title,
        href: getURL(item.path),
        spaceTitle: space?.title,
    };

    return [page, ...sections];
}
