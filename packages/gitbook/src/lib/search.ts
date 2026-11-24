import type {
    Revision,
    RevisionPageDocument,
    SearchPageResult,
    SearchSpaceResult,
    SiteSection,
    SiteSectionGroup,
    SiteSpace,
    SiteStructure,
} from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

import type { ComputedPageResult } from '@/components/Search/search-types';
import type { GitBookLinker } from '@/lib/links';
import { resolvePageId } from '@/lib/pages';
import {
    type SearchResultBreadcrumb,
    type SearchSpaceEntry,
    type SearchSpaceLookup,
    buildSearchPageResult,
    getPublishedPageHref,
} from '@/lib/search-results';
import { findSiteSpaceBy, getLocalizedTitle, listAllSiteSpaces } from '@/lib/sites';

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
    const entry = getSearchSpaceEntry({ siteSpace, siteSection, siteSectionGroup });

    if (revisionPages) {
        const resolved = resolvePageId(revisionPages, pageItem.id);
        if (!resolved || resolved.page.id !== pageItem.id) {
            return null;
        }

        const revisionTarget: { pages: Revision['pages']; page: RevisionPageDocument } = {
            pages: revisionPages,
            page: resolved.page,
        };

        return buildSearchPageResult({
            pageItem,
            spaceItem,
            entry,
            pageHref: linker.toPathForPage(revisionTarget),
            getSectionHref: (sectionPath) =>
                linker.toPathForPage({
                    ...revisionTarget,
                    anchor: getRetainableSectionAnchor(sectionPath, pageItem.path),
                }),
        });
    }

    const toHref = (pagePath: string) =>
        getPublishedPageHref({ asEmbeddable, linker, pagePath, spaceURL: entry.spaceURL });

    return buildSearchPageResult({
        pageItem,
        spaceItem,
        entry,
        pageHref: toHref(pageItem.path),
        getSectionHref: toHref,
    });
}

/** Index visible spaces by default, or resolve specific readable published spaces. */
export function getSearchSpaceLookup(
    structure: SiteStructure,
    requestedSpaceIds?: string[]
): SearchSpaceLookup {
    const lookup: SearchSpaceLookup = {};
    const ids = requestedSpaceIds ?? listAllSiteSpaces(structure).map(({ space }) => space.id);

    for (const id of new Set(ids)) {
        const found = findSiteSpaceBy(structure, (siteSpace) => siteSpace.space.id === id);
        if (!found) {
            continue;
        }

        const { siteSpace, siteSection, siteSectionGroup } = found;
        if (requestedSpaceIds) {
            if (siteSpace.draft || !siteSpace.space.permissions.view || !siteSpace.urls.published) {
                continue;
            }
        } else if (siteSpace.hidden) {
            continue;
        }

        lookup[id] = getSearchSpaceEntry({
            siteSpace,
            siteSection: siteSection ?? undefined,
            siteSectionGroup: siteSectionGroup ?? undefined,
        });
    }

    return lookup;
}

function getSearchSpaceEntry(input: {
    siteSpace?: SiteSpace;
    siteSection?: SiteSection;
    siteSectionGroup?: SiteSectionGroup | null;
}): SearchSpaceEntry {
    const { siteSpace, siteSection, siteSectionGroup } = input;
    const currentLanguage = siteSpace?.space.language;
    const breadcrumbs: SearchResultBreadcrumb[] = [];

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

    return {
        siteSpaceId: siteSpace?.id,
        spaceURL: siteSpace?.urls.published,
        breadcrumbs,
    };
}

function getRetainableSectionAnchor(sectionPath: string, pagePath: string): string | undefined {
    const hashIndex = sectionPath.indexOf('#');
    if (hashIndex === -1 || sectionPath.slice(0, hashIndex) !== pagePath) {
        return undefined;
    }

    return sectionPath.slice(hashIndex + 1) || undefined;
}
