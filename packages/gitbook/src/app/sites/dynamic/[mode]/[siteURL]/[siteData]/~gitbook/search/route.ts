import type {
    ComputedPageResult,
    ComputedSectionResult,
    OrderedComputedResult,
    SearchSiteContentRequest,
} from '@/components/Search/search-types';
import { throwIfDataError } from '@/lib/data';
import { getEmbeddableLinker } from '@/lib/embeddable-linker';
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
} from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    let [context, siteURLData] = await Promise.all([
        getServerActionBaseContext(),
        getSiteURLDataFromMiddleware(),
    ]);
    const { asEmbeddable, query, scope } = (await request.json()) as SearchSiteContentRequest;

    if (asEmbeddable) {
        context = { ...context, linker: getEmbeddableLinker(context.linker) };
    }

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

    const results = searchResults
        .flatMap((resultItem) => {
            if (resultItem.type === 'record') {
                const result: OrderedComputedResult = {
                    type: 'record',
                    id: resultItem.id,
                    title: resultItem.title,
                    description: resultItem.description,
                    href: resultItem.url,
                    score: resultItem.score,
                };

                return [{ score: resultItem.score, items: [result] }];
            }

            const found = findSiteSpaceBy(
                structure,
                (siteSpace) => siteSpace.space.id === resultItem.id
            );

            return resultItem.pages.map((pageItem) => ({
                score: pageItem.score,
                items: transformSitePageResult({
                    linker: context.linker,
                    pageItem,
                    spaceItem: resultItem,
                    siteSpace: found?.siteSpace,
                    siteSection: found?.siteSection ?? undefined,
                    siteSectionGroup: found?.siteSectionGroup ?? undefined,
                }),
            }));
        })
        .sort((a, b) => b.score - a.score)
        .flatMap((group) => group.items);

    return NextResponse.json(results);
}

function transformSitePageResult(args: {
    linker: Awaited<ReturnType<typeof getServerActionBaseContext>>['linker'];
    pageItem: SearchPageResult;
    spaceItem: SearchSpaceResult;
    siteSpace?: SiteSpace;
    siteSection?: SiteSection;
    siteSectionGroup?: SiteSectionGroup | null;
}): OrderedComputedResult[] {
    const { pageItem, spaceItem, siteSection, siteSectionGroup, siteSpace, linker } = args;
    const currentLanguage = siteSpace?.space.language;
    const spaceURL = siteSpace?.urls.published;
    const breadcrumbs: NonNullable<ComputedPageResult['breadcrumbs']> = [];

    if (siteSectionGroup) {
        breadcrumbs.push({
            icon: siteSectionGroup.icon as IconName,
            label: getLocalizedTitle(siteSectionGroup, currentLanguage),
        });
    }

    if (siteSection) {
        breadcrumbs.push({
            icon: siteSection.icon as IconName,
            label: getLocalizedTitle(siteSection, currentLanguage),
        });
    }

    if (
        (siteSection?.siteSpaces?.filter(
            (space) =>
                siteSection.siteSpaces?.filter(
                    (candidate) => candidate.space.language === space.space.language
                ).length > 1
        ).length ?? 0) > 1 &&
        siteSpace
    ) {
        breadcrumbs.push({
            label: getLocalizedTitle(siteSpace, currentLanguage),
        });
    }

    breadcrumbs.push(
        ...pageItem.ancestors.map((ancestor) => ({
            label: ancestor.title,
        }))
    );

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
        breadcrumbs,
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
