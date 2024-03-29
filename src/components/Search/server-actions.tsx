'use server';

import { RevisionPage, SearchAIAnswer, SearchPageResult } from '@gitbook/api';

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
    body: React.ReactNode;
    followupQuestions: string[];
    sources: AskAnswerSource[];
}

/**
 * Server action to search content in a space
 */
export async function searchSpaceContent(
    spaceId: string,
    revisionId: string,
    query: string,
): Promise<OrderedComputedResult[]> {
    const data = await api.searchSpaceContent(spaceId, revisionId, query);
    return data.items.map((item) => transformPageResult(item, undefined)).flat();
}

/**
 * Server action to search content in a collection
 */
export async function searchCollectionContent(
    collectionId: string,
    query: string,
): Promise<OrderedComputedResult[]> {
    const data = await api.searchCollectionContent(collectionId, query);

    return data.items
        .map((spaceItem) => {
            return spaceItem.pages.map((item) => transformPageResult(item, spaceItem.title));
        })
        .flat(2);
}

/**
 * Server action to ask a question in a space.
 */
export const streamAskQuestion = streamResponse(async function* (spaceId: string, query: string) {
    const stream = api.api().spaces.streamAskInSpace(spaceId, { query, format: 'document' });
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
    if (!answer || !('document' in answer.answer)) {
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
        body: (
            <DocumentView
                document={answer.answer.document}
                context={{
                    mode: 'default',
                    contentRefContext: null,
                    resolveContentRef: async () => null,
                }}
                style={['space-y-5']}
            />
        ),
        followupQuestions: answer.followupQuestions,
        sources,
    };
}

function transformPageResult(item: SearchPageResult, spaceTitle?: string) {
    const sections =
        item.sections?.map<ComputedSectionResult>((section) => ({
            type: 'section',
            id: item.id + '/' + section.id,
            title: section.title,
            href: absoluteHref(section.path),
            body: section.body,
        })) ?? [];

    const page: ComputedPageResult = {
        type: 'page',
        id: item.id,
        title: item.title,
        href: absoluteHref(item.path),
        spaceTitle,
    };

    return [page, ...sections];
}
