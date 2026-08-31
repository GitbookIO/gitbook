import { type NextRequest, NextResponse } from 'next/server';

import { orderSearchResultGroups } from './orderSearchResults';
import { transformSitePageResult } from './transformSitePageResult';
import type {
    OrderedComputedResult,
    SearchSiteContentRequest,
} from '@/components/Search/search-types';
import { throwIfDataError } from '@/lib/data';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { getServerActionBaseContext } from '@/lib/server-actions';
import { findSiteSpaceBy } from '@/lib/sites';

export async function POST(request: NextRequest) {
    const { asEmbeddable, query, scope } = (await request.json()) as SearchSiteContentRequest;
    const [context, siteURLData] = await Promise.all([
        getServerActionBaseContext({ isEmbeddable: asEmbeddable }),
        getSiteURLDataFromMiddleware(),
    ]);

    if (query.length <= 1) {
        return NextResponse.json([]);
    }

    const [searchResults, { structure }] = await Promise.all([
        throwIfDataError(
            context.dataFetcher.searchSiteContent({
                organizationId: siteURLData.organization,
                siteId: siteURLData.site,
                query,
                scope,
            })
        ),
        throwIfDataError(
            context.dataFetcher.getPublishedContentSite({
                organizationId: siteURLData.organization,
                siteId: siteURLData.site,
                siteShareKey: siteURLData.shareKey,
            })
        ),
    ]);

    const results = orderSearchResultGroups<OrderedComputedResult>(
        searchResults.map((resultItem) => {
            if (resultItem.type === 'record') {
                const result: OrderedComputedResult = {
                    type: 'record',
                    id: resultItem.id,
                    title: resultItem.title,
                    description: resultItem.description,
                    href: resultItem.url,
                    score: resultItem.score,
                };

                return { type: 'context' as const, results: [result] };
            }

            const found = findSiteSpaceBy(
                structure,
                (siteSpace) => siteSpace.space.id === resultItem.id
            );

            return {
                type: 'pages' as const,
                results: resultItem.pages.map((pageItem) => ({
                    rank: pageItem.rank,
                    result: transformSitePageResult({
                        asEmbeddable: Boolean(asEmbeddable),
                        linker: context.linker,
                        pageItem,
                        spaceItem: resultItem,
                        siteSpace: found?.siteSpace,
                        siteSection: found?.siteSection ?? undefined,
                        siteSectionGroup: found?.siteSectionGroup ?? undefined,
                    }),
                })),
            };
        })
    );

    return NextResponse.json(results);
}
