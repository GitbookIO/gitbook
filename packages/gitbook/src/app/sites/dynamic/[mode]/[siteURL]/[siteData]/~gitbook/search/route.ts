import type {
    ComputedPageResult,
    ComputedSectionResult,
    OrderedComputedResult,
    SearchSiteContentRequest,
} from '@/components/Search/search-types';
import type { GitBookBaseContext } from '@/lib/context';
import { throwIfDataError } from '@/lib/data';
import { getSiteURLDataFromMiddleware } from '@/lib/middleware';
import { joinPathWithBaseURL } from '@/lib/paths';
import { getServerActionBaseContext } from '@/lib/server-actions';
import { findSiteSpaceBy, getLocalizedTitle } from '@/lib/sites';
import type {
    SearchPageResult,
    SearchSpaceResult,
    SiteSection,
    SiteSectionGroup,
    SiteSpace,
    Space,
} from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import { type NextRequest, NextResponse } from 'next/server';

type SearchResultGroup = {
    score: number;
    items: OrderedComputedResult[];
};

export async function POST(request: NextRequest) {
    const [context, { organization, site, shareKey }] = await Promise.all([
        getServerActionBaseContext(),
        getSiteURLDataFromMiddleware(),
    ]);
    const body = (await request.json()) as SearchSiteContentRequest;
    const { query, scope } = body;

    if (query.length <= 1) {
        return NextResponse.json([]);
    }

    const [searchResults, { structure }] = await Promise.all([
        (async () => {
            const result = await throwIfDataError(
                context.dataFetcher.searchSiteContent({
                    organizationId: organization,
                    siteId: site,
                    query,
                    scope,
                })
            );
            return result;
        })(),
        (async () => {
            const result = await throwIfDataError(
                context.dataFetcher.getPublishedContentSite({
                    organizationId: organization,
                    siteId: site,
                    siteShareKey: shareKey,
                })
            );
            return result;
        })(),
    ]);

    const results = searchResults
        .flatMap((resultItem): SearchResultGroup[] => {
            if (resultItem.type === 'record') {
                const result: OrderedComputedResult = {
                    type: 'record',
                    id: resultItem.id,
                    title: resultItem.title,
                    description: resultItem.description,
                    href: resultItem.url,
                    score: resultItem.score,
                };
                return [
                    {
                        score: resultItem.score,
                        items: [result],
                    },
                ];
            }

            const found = findSiteSpaceBy(
                structure,
                (siteSpace) => siteSpace.space.id === resultItem.id
            );
            const siteSection = found?.siteSection;
            const siteSectionGroup = found?.siteSectionGroup;

            return resultItem.pages.map((pageItem) => ({
                score: pageItem.score,
                items: transformSitePageResult(context, {
                    pageItem,
                    spaceItem: resultItem,
                    siteSpace: found?.siteSpace,
                    space: found?.siteSpace.space,
                    spaceURL: found?.siteSpace.urls.published,
                    siteSection: siteSection ?? undefined,
                    siteSectionGroup: (siteSectionGroup as SiteSectionGroup) ?? undefined,
                }),
            }));
        })
        .sort((a, b) => b.score - a.score)
        .flatMap((group) => group.items);

    return NextResponse.json(results);
}

function transformSitePageResult(
    context: GitBookBaseContext,
    args: {
        pageItem: SearchPageResult;
        spaceItem: SearchSpaceResult;
        space?: Space;
        siteSpace?: SiteSpace;
        spaceURL?: string;
        siteSection?: SiteSection;
        siteSectionGroup?: SiteSectionGroup;
    }
): OrderedComputedResult[] {
    const { pageItem, spaceItem, spaceURL, siteSection, siteSectionGroup, siteSpace } = args;
    const { linker } = context;
    const currentLanguage = siteSpace?.space.language;

    const page: ComputedPageResult = {
        type: 'page',
        id: `${spaceItem.id}/${pageItem.id}`,
        title: pageItem.title,
        href: spaceURL
            ? linker.toLinkForContent(joinPathWithBaseURL(spaceURL, pageItem.path))
            : linker.toPathInSpace(pageItem.path),
        pageId: pageItem.id,
        spaceId: spaceItem.id,
        score: pageItem.score,
        breadcrumbs: [
            siteSectionGroup && {
                icon: siteSectionGroup?.icon as IconName,
                label: getLocalizedTitle(siteSectionGroup, currentLanguage),
            },
            siteSection && {
                icon: siteSection?.icon as IconName,
                label: getLocalizedTitle(siteSection, currentLanguage),
            },
            (siteSection?.siteSpaces?.filter(
                (space) =>
                    siteSection?.siteSpaces?.filter(
                        (s) => s.space.language === space.space.language
                    ).length > 1
            ).length ?? 0) > 1 && siteSpace
                ? {
                      label: getLocalizedTitle(siteSpace, currentLanguage),
                  }
                : undefined,
            ...pageItem.ancestors.map((ancestor) => ({
                label: ancestor.title,
            })),
        ].filter((item) => item !== undefined),
    };

    const pageSections =
        pageItem.sections
            ?.filter((section) => section.title || section.body)
            .map<ComputedSectionResult>((section) => ({
                type: 'section',
                id: `${page.id}/${section.id}`,
                title: section.title,
                href: spaceURL
                    ? linker.toLinkForContent(joinPathWithBaseURL(spaceURL, section.path))
                    : linker.toPathInSpace(pageItem.path),
                body: section.body,
                pageId: pageItem.id,
                spaceId: spaceItem.id,
                score: section.score,
            })) ?? [];

    return [page, ...pageSections];
}
