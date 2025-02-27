import type { SiteSection, SiteSectionGroup, SiteSpace, SiteStructure } from '@gitbook/api';

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
