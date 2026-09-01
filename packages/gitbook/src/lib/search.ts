import type {
    SearchPageResult,
    SearchSpaceResult,
    SiteSection,
    SiteSectionGroup,
    SiteSpace,
} from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

import type { ComputedPageResult, ComputedSectionResult } from '@/components/Search/search-types';
import { toEmbeddableLinkForPublishedContent } from '@/lib/embeddable-linker';
import type { GitBookLinker } from '@/lib/links';
import { joinPathWithBaseURL } from '@/lib/paths';
import { getLocalizedTitle } from '@/lib/sites';
import { checkIsHttpURL } from '@/lib/urls';

export function transformSitePageResult(args: {
    asEmbeddable: boolean;
    linker: GitBookLinker;
    pageItem: SearchPageResult;
    spaceItem: SearchSpaceResult;
    siteSpace?: SiteSpace;
    siteSection?: SiteSection;
    siteSectionGroup?: SiteSectionGroup | null;
}): ComputedPageResult {
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

    const pageHref = checkIsHttpURL(pageItem.path)
        ? pageItem.path
        : !spaceURL
          ? linker.toPathInSpace(pageItem.path)
          : asEmbeddable
            ? toEmbeddableLinkForPublishedContent(linker, spaceURL, pageItem.path)
            : linker.toLinkForContent(joinPathWithBaseURL(spaceURL, pageItem.path));

    const page: ComputedPageResult = {
        type: 'page',
        id: `${spaceItem.id}/${pageItem.id}`,
        title: pageItem.title,
        description: pageItem.description,
        href: pageHref,
        pageId: pageItem.id,
        spaceId: spaceItem.id,
        siteSpaceId: siteSpace?.id,
        score: pageItem.score,
        rank: pageItem.rank,
        resultType: pageItem.resultType,
        breadcrumbs,
    };

    const pageSections =
        pageItem.sections
            ?.filter((section) => section.title || section.body)
            .map<ComputedSectionResult>((section) => {
                let sectionHref = linker.toPathInSpace(section.path);

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

    // The API returns at most one section per page, ordered for use as the section destination preview.
    const bestSection = pageSections[0];
    if (bestSection) {
        page.bestSection = {
            href: bestSection.href,
            title: bestSection.title,
            body: bestSection.body,
            score: bestSection.score,
        };
    }

    return page;
}
