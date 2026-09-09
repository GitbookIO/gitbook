import { type NextRequest, NextResponse } from 'next/server';

import { orderSearchResultGroups } from './orderSearchResults';
import type {
    OrderedComputedResult,
    SearchSiteContentRequest,
} from '@/components/Search/search-types';
import { throwIfDataError } from '@/lib/data';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { transformSitePageResult } from '@/lib/search';
import { getServerActionBaseContext } from '@/lib/server-actions';
import { findSiteSpaceBy, getLinkerForSiteSpace } from '@/lib/sites';

export async function POST(request: NextRequest) {
    const { asEmbeddable, query, scope } = (await request.json()) as SearchSiteContentRequest;
    const [context, siteURLData] = await Promise.all([
        getServerActionBaseContext({ isEmbeddable: asEmbeddable }),
        getSiteURLDataFromMiddleware(),
    ]);

    if (query.length <= 1) {
        return NextResponse.json([]);
    }

    const [searchResults, { structure }, revision] = await Promise.all([
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
        siteURLData.revision
            ? throwIfDataError(
                  context.dataFetcher.getRevision({
                      spaceId: siteURLData.space,
                      revisionId: siteURLData.revision,
                  })
              )
            : Promise.resolve(undefined),
    ]);

    const currentSiteSpace = revision
        ? findSiteSpaceBy(structure, (siteSpace) => siteSpace.id === siteURLData.siteSpace)
        : null;
    const revisionLinker =
        revision && currentSiteSpace
            ? getLinkerForSiteSpace(context.linker, currentSiteSpace.siteSpace, revision.pages)
            : context.linker;

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

            const isCurrentRevisionSpace = Boolean(revision && resultItem.id === siteURLData.space);
            const found =
                isCurrentRevisionSpace && currentSiteSpace
                    ? currentSiteSpace
                    : findSiteSpaceBy(
                          structure,
                          (siteSpace) => siteSpace.space.id === resultItem.id
                      );

            return {
                type: 'pages' as const,
                results: resultItem.pages.flatMap((pageItem) => {
                    const result = transformSitePageResult({
                        asEmbeddable: Boolean(asEmbeddable),
                        linker: isCurrentRevisionSpace ? revisionLinker : context.linker,
                        pageItem,
                        spaceItem: resultItem,
                        siteSpace: found?.siteSpace,
                        siteSection: found?.siteSection ?? undefined,
                        siteSectionGroup: found?.siteSectionGroup ?? undefined,
                        revisionPages: isCurrentRevisionSpace ? revision?.pages : undefined,
                    });

                    return result ? [{ rank: pageItem.rank, result }] : [];
                }),
            };
        })
    );

    return NextResponse.json(results);
}
