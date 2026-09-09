import type {
    Revision,
    RevisionPageDocument,
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
import { resolvePageId } from '@/lib/pages';
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
    revisionPages?: Revision['pages'];
}): ComputedPageResult | null {
    const {
        asEmbeddable,
        pageItem,
        spaceItem,
        siteSection,
        siteSectionGroup,
        siteSpace,
        linker,
        revisionPages,
    } = args;
    const currentLanguage = siteSpace?.space.language;
    const spaceURL = siteSpace?.urls.published;
    const breadcrumbs: NonNullable<ComputedPageResult['breadcrumbs']> = [];

    let revisionTarget: { pages: Revision['pages']; page: RevisionPageDocument } | undefined;
    if (revisionPages) {
        const resolved = resolvePageId(revisionPages, pageItem.id);
        if (!resolved || resolved.page.id !== pageItem.id) {
            return null;
        }

        revisionTarget = { pages: revisionPages, page: resolved.page };
    }

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

    const pageHref = revisionTarget
        ? linker.toPathForPage(revisionTarget)
        : getPublishedPageHref({ asEmbeddable, linker, pagePath: pageItem.path, spaceURL });

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
                const anchor = revisionTarget
                    ? getRetainableSectionAnchor(section.path, pageItem.path)
                    : undefined;
                const sectionHref = revisionTarget
                    ? linker.toPathForPage({
                          ...revisionTarget,
                          anchor,
                      })
                    : getPublishedPageHref({
                          asEmbeddable,
                          linker,
                          pagePath: section.path,
                          spaceURL,
                      });

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

function getRetainableSectionAnchor(sectionPath: string, pagePath: string): string | undefined {
    const hashIndex = sectionPath.indexOf('#');
    if (hashIndex === -1 || sectionPath.slice(0, hashIndex) !== pagePath) {
        return undefined;
    }

    return sectionPath.slice(hashIndex + 1) || undefined;
}

function getPublishedPageHref(input: {
    asEmbeddable: boolean;
    linker: GitBookLinker;
    pagePath: string;
    spaceURL: string | undefined;
}) {
    const { asEmbeddable, linker, pagePath, spaceURL } = input;

    if (checkIsHttpURL(pagePath)) {
        return pagePath;
    }

    if (!spaceURL) {
        return linker.toPathInSpace(pagePath);
    }

    return asEmbeddable
        ? toEmbeddableLinkForPublishedContent(linker, spaceURL, pagePath)
        : linker.toLinkForContent(joinPathWithBaseURL(spaceURL, pagePath));
}
