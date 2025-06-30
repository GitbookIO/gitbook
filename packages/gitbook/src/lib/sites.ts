import type { GitBookSiteContext } from '@/lib/context';
import type { SiteSection, SiteSectionGroup, SiteSpace, SiteStructure } from '@gitbook/api';
import { joinPath } from './paths';

/**
 * Get all sections from a site structure.
 * Set the `ignoreGroups` option to true to flatten the list to only include SiteSection and to not include SiteSectionGroups.
 */
export function getSiteStructureSections(
    siteStructure: SiteStructure,
    options: { ignoreGroups: true }
): SiteSection[];
export function getSiteStructureSections(
    siteStructure: SiteStructure,
    options?: { ignoreGroups: false }
): SiteSection[] | SiteSectionGroup[];
export function getSiteStructureSections(
    siteStructure: SiteStructure,
    options?: { ignoreGroups: boolean }
) {
    const { ignoreGroups } = options ?? { ignoreGroups: false };
    return siteStructure.type === 'sections'
        ? ignoreGroups
            ? siteStructure.structure.flatMap((item) =>
                  item.object === 'site-section-group' ? item.sections : item
              )
            : siteStructure.structure
        : [];
}

/*
 * Gets all site spaces, in a site structure and overrides the title
 */
export function listAllSiteSpaces(siteStructure: SiteStructure) {
    if (siteStructure.type === 'siteSpaces') {
        return siteStructure.structure;
    }

    return siteStructure.structure.flatMap((section) => {
        if (section.object === 'site-section') {
            return section.siteSpaces;
        }

        return section.sections.flatMap((subSection) => subSection.siteSpaces);
    });
}

/**
 * Find a site space by its spaceId in a site structure.
 */
export function findSiteSpaceBy(
    siteStructure: SiteStructure,
    predicate: (siteSpace: SiteSpace) => boolean
): {
    siteSpace: SiteSpace;
    siteSection: SiteSection | null;
    siteSectionGroup: SiteSectionGroup | null;
} | null {
    if (siteStructure.type === 'siteSpaces') {
        const siteSpace = siteStructure.structure.find(predicate) ?? null;
        if (siteSpace) {
            return {
                siteSpace,
                siteSection: null,
                siteSectionGroup: null,
            };
        }

        return null;
    }

    for (const sectionOrGroup of siteStructure.structure) {
        if (sectionOrGroup.object === 'site-section') {
            const siteSpace = findSiteSpaceByIdInSiteSpaces(sectionOrGroup.siteSpaces, predicate);
            if (siteSpace) {
                return {
                    siteSpace,
                    siteSection: sectionOrGroup,
                    siteSectionGroup: null,
                };
            }
        } else {
            const found = findSiteSpaceByIdInSections(sectionOrGroup.sections, predicate);
            if (found) {
                return {
                    siteSpace: found.siteSpace,
                    siteSection: found.siteSection,
                    siteSectionGroup: sectionOrGroup,
                };
            }
        }
    }

    return null;
}

/**
 * Get the URL to navigate to for a section.
 * When the site is not published yet, `urls.published` is not available.
 * To ensure navigation works in preview, we compute a relative URL from the siteSection path.
 */
export function getSectionURL(context: GitBookSiteContext, section: SiteSection) {
    const { linker } = context;
    return section.urls.published
        ? linker.toLinkForContent(section.urls.published)
        : linker.toPathInSite(section.path);
}

/**
 * Get the URL to navigate to for a site space.
 * When the site is not published yet, `urls.published` is not available.
 * To ensure navigation works in preview, we compute a relative URL from the siteSpace path.
 */
export function getSiteSpaceURL(context: GitBookSiteContext, siteSpace: SiteSpace) {
    const { linker } = context;
    if (siteSpace.urls.published) {
        return linker.toLinkForContent(siteSpace.urls.published);
    }

    return linker.toPathInSite(getFallbackSiteSpacePath(context, siteSpace));
}

/**
 * Get the path of a site space in the current site.
 * This doesn't return the most optimized path, as it doesn't take into account which one is the default one.
 */
export function getFallbackSiteSpacePath(context: GitBookSiteContext, siteSpace: SiteSpace) {
    const found = findSiteSpaceBy(context.structure, (entry) => entry.id === siteSpace.id);
    const siteSpacePath = siteSpace.default ? '' : siteSpace.path;

    if (found?.siteSection && !found?.siteSection.default) {
        return joinPath(found.siteSection.path, siteSpacePath);
    }

    return siteSpacePath;
}

function findSiteSpaceByIdInSections(
    sections: SiteSection[],
    predicate: (siteSpace: SiteSpace) => boolean
): { siteSpace: SiteSpace; siteSection: SiteSection } | null {
    for (const siteSection of sections) {
        const siteSpace = siteSection.siteSpaces.find(predicate) ?? null;
        if (siteSpace) {
            return { siteSpace, siteSection };
        }
    }

    return null;
}

function findSiteSpaceByIdInSiteSpaces(
    siteSpaces: SiteSpace[],
    predicate: (siteSpace: SiteSpace) => boolean
): SiteSpace | null {
    return siteSpaces.find(predicate) ?? null;
}
