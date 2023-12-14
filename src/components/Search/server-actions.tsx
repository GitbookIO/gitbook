'use server';

import { api, getRevisionPages } from '@/lib/api';
import { absoluteHref, pageHref } from '@/lib/links';
import { resolvePageId } from '@/lib/pages';
import { tcls } from '@/lib/tailwind';
import { filterOutNullable } from '@/lib/typescript';

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
}

export interface AskAnswerSource {
    id: string;
    title: string;
    href: string;
    ancestors: Array<{
        id: string;
        title: string;
        href: string;
    }>;
}

export interface AskAnswerResult {
    body: React.ReactNode;
    followupQuestions: string[];
    sources: AskAnswerSource[];
}

/**
 * Server action to search content in a space.
 */
export async function searchContent(
    spaceId: string,
    query: string,
): Promise<OrderedComputedResult[]> {
    const { data } = await api().spaces.searchSpaceContent(spaceId, { query });
    return data.items
        .map((item) => {
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
            };

            return [page, ...sections];
        })
        .flat();
}

/**
 * Server action to ask a question in a space.
 */
export async function askQuestion(spaceId: string, query: string): Promise<AskAnswerResult | null> {
    const [{ data }, pages] = await Promise.all([
        api().spaces.askQueryInSpace(spaceId, { query }),
        getRevisionPages({ spaceId }),
    ]);

    if (!data.answer) {
        return null;
    }

    const sources = data.answer.sources
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
                ancestors: page.ancestors.map((ancestor) => ({
                    id: ancestor.id,
                    title: ancestor.title,
                    href: pageHref(pages, ancestor),
                })),
            };
        })
        .filter(filterOutNullable);

    return {
        body: (
            // TODO: parse the markdown
            <p className={tcls('text-base', 'font-normal')}>{data.answer.text}</p>
        ),
        followupQuestions: data.answer.followupQuestions,
        sources,
    };
}

/**
 * List suggested questions for a space.
 */
export async function getRecommendedQuestions(spaceId: string): Promise<string[]> {
    const { data } = await api().spaces.getRecommendedQuestionsInSpace(spaceId);
    return data.questions;
}
