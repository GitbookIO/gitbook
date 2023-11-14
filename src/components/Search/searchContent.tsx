'use server';

import { api } from '@/lib/api';
import { absoluteHref } from '@/lib/links';

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
