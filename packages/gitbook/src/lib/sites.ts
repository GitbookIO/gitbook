import type { SiteSection, SiteSectionGroup, SiteSpace, SiteStructure } from '@gitbook/api';
import type { GitBookSiteContext } from '@v2/lib/context';
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
export function findSiteSpaceById(siteStructure: SiteStructure, spaceId: string): SiteSpace | null {
    if (siteStructure.type === 'siteSpaces') {
        return siteStructure.structure.find((siteSpace) => siteSpace.space.id === spaceId) ?? null;
    }

    for (const section of siteStructure.structure) {
        const siteSpace =
            section.object === 'site-section'
                ? findSiteSpaceByIdInSiteSpaces(section.siteSpaces, spaceId)
                : findSiteSpaceByIdInSections(section.sections, spaceId);
        if (siteSpace) {
            return siteSpace;
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
    const { linker, sections } = context;
    if (siteSpace.urls.published) {
        return linker.toLinkForContent(siteSpace.urls.published);
    }

    return linker.toPathInSite(
        sections?.current ? joinPath(sections.current.path, siteSpace.path) : siteSpace.path
    );
}

function findSiteSpaceByIdInSections(sections: SiteSection[], spaceId: string): SiteSpace | null {
    for (const section of sections) {
        const siteSpace =
            section.siteSpaces.find((siteSpace) => siteSpace.space.id === spaceId) ?? null;
        if (siteSpace) {
            return siteSpace;
        }
    }

    return null;
}

function findSiteSpaceByIdInSiteSpaces(siteSpaces: SiteSpace[], spaceId: string): SiteSpace | null {
    return siteSpaces.find((siteSpace) => siteSpace.space.id === spaceId) ?? null;
}
