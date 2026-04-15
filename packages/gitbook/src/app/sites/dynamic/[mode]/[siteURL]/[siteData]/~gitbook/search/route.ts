import type {
    ComputedPageResult,
    ComputedSectionResult,
    OrderedComputedResult,
    SearchSiteContentRequest,
} from '@/components/Search/search-types';
import { throwIfDataError } from '@/lib/data';
import { toEmbeddableLinkForPublishedContent } from '@/lib/embeddable-linker';
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
                    asEmbeddable: Boolean(asEmbeddable),
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
    asEmbeddable: boolean;
    linker: Awaited<ReturnType<typeof getServerActionBaseContext>>['linker'];
    pageItem: SearchPageResult;
    spaceItem: SearchSpaceResult;
    siteSpace?: SiteSpace;
    siteSection?: SiteSection;
    siteSectionGroup?: SiteSectionGroup | null;
}): OrderedComputedResult[] {
    const { asEmbeddable, pageItem, spaceItem, siteSection, siteSectionGroup, siteSpace, linker } =
        args;
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

    const pageHref = !spaceURL
        ? linker.toPathInSpace(pageItem.path)
        : asEmbeddable
          ? toEmbeddableLinkForPublishedContent(linker, spaceURL, pageItem.path)
          : linker.toLinkForContent(joinPathWithBaseURL(spaceURL, pageItem.path));

    const page: ComputedPageResult = {
        type: 'page',
        id: `${spaceItem.id}/${pageItem.id}`,
        title: pageItem.title,
        href: pageHref,
        pageId: pageItem.id,
        spaceId: spaceItem.id,
        score: pageItem.score,
        breadcrumbs,
    };

    const pageSections =
        pageItem.sections
            ?.filter((section) => section.title || section.body)
            .map<ComputedSectionResult>((section) => {
                let sectionHref = linker.toPathInSpace(pageItem.path);

                if (spaceURL) {
                    if (asEmbeddable) {
                        sectionHref = toEmbeddableLinkForPublishedContent(
                            linker,
                            spaceURL,
                            section.path
                        );
                    } else {
                        sectionHref = linker.toLinkForContent(
                            joinPathWithBaseURL(spaceURL, section.path)
                        );
                    }
                }

                return {
                    type: 'section',
                    id: `${page.id}/${section.id}`,
                    title: section.title,
                    href: sectionHref,
                    body: section.body,
                    pageId: pageItem.id,
                    spaceId: spaceItem.id,
                    score: section.score,
                };
            }) ?? [];

    return [page, ...pageSections];
}
