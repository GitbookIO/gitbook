import { type NextRequest, NextResponse } from 'next/server';

import type { SearchSiteContentRequest } from '@/components/Search/search-types';
import { throwIfDataError } from '@/lib/data';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { transformSitePageResult } from '@/lib/search';
import { computeSearchResults } from '@/lib/search-results';
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

    const results = computeSearchResults(searchResults, (spaceItem, pageItem) => {
        const isCurrentRevisionSpace = Boolean(revision && spaceItem.id === siteURLData.space);
        const found =
            isCurrentRevisionSpace && currentSiteSpace
                ? currentSiteSpace
                : findSiteSpaceBy(structure, (siteSpace) => siteSpace.space.id === spaceItem.id);

        return transformSitePageResult({
            asEmbeddable: Boolean(asEmbeddable),
            linker: isCurrentRevisionSpace ? revisionLinker : context.linker,
            pageItem,
            spaceItem,
            siteSpace: found?.siteSpace,
            siteSection: found?.siteSection ?? undefined,
            siteSectionGroup: found?.siteSectionGroup ?? undefined,
            revisionPages: isCurrentRevisionSpace ? revision?.pages : undefined,
        });
    });

    return NextResponse.json(results);
}
