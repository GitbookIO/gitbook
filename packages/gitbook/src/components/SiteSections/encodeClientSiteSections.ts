import { getSectionURL, getSiteSpaceURL } from '@/lib/sites';
import type { SiteSection, SiteSectionGroup, SiteSpace } from '@gitbook/api';
import type { GitBookSiteContext, SiteSections } from '@v2/lib/context';

export type ClientSiteSections = {
    list: (ClientSiteSection | ClientSiteSectionGroup)[];
    current: ClientSiteSection;
};

export type ClientSiteSection = Pick<
    SiteSection,
    'id' | 'title' | 'description' | 'icon' | 'object'
> & {
    url: string;
};

export type ClientSiteSectionGroup = Pick<SiteSectionGroup, 'id' | 'title' | 'icon' | 'object'> & {
    sections: ClientSiteSection[];
};

/**
 * Encode the list of site sections into the data to be rendered in the client.
 */
export function encodeClientSiteSections(context: GitBookSiteContext, sections: SiteSections) {
    const { list, current } = sections;

    const clientSections: (ClientSiteSection | ClientSiteSectionGroup)[] = [];

    for (const item of list) {
        if (item.object === 'site-section-group') {
            clientSections.push({
                id: item.id,
                title: item.title,
                icon: item.icon,
                object: item.object,
                sections: item.sections
                    .filter((section) => shouldIncludeSection(context, section))
                    .map((section) => encodeSection(context, section)),
            });
        } else {
            if (shouldIncludeSection(context, item)) {
                clientSections.push(encodeSection(context, item));
            }
        }
    }

    return {
        list: clientSections,
        current: encodeSection(context, current),
    };
}

function encodeSection(context: GitBookSiteContext, section: SiteSection) {
    return {
        id: section.id,
        title: section.title,
        description: section.description,
        icon: section.icon,
        object: section.object,
        url: findBestTargetURL(context, section),
    };
}

/**
 * Test if a section should be included in the list of sections.
 */
function shouldIncludeSection(context: GitBookSiteContext, section: SiteSection) {
    if (context.site.id !== 'site_JOVzv') {
        return true;
    }

    // Testing for a new mode of navigation where the multi-variants section are hidden
    // if they do not include an equivalent of the current site space.

    // TODO: replace with a proper flag on the section
    const withNavigateOnlyIfEquivalent = section.id === 'sitesc_4jvEm';

    if (!withNavigateOnlyIfEquivalent) {
        return true;
    }

    const { siteSpace: currentSiteSpace } = context;
    if (section.siteSpaces.length === 1) {
        return true;
    }
    return section.siteSpaces.some((siteSpace) =>
        areSiteSpacesEquivalent(siteSpace, currentSiteSpace)
    );
}

/**
 * Find the best default site space to navigate to for a givent section:
 * 1. If we are on the default, continue on the default.
 * 2. If a site space has the same path as the current one, return it.
 * 3. Otherwise, return the default one.
 */
function findBestTargetURL(context: GitBookSiteContext, section: SiteSection) {
    const { siteSpace: currentSiteSpace } = context;

    if (section.siteSpaces.length === 1 || currentSiteSpace.default) {
        return getSectionURL(context, section);
    }

    const bestMatch = section.siteSpaces.find((siteSpace) =>
        areSiteSpacesEquivalent(siteSpace, currentSiteSpace)
    );
    if (bestMatch) {
        return getSiteSpaceURL(context, bestMatch);
    }

    return getSectionURL(context, section);
}

/**
 * Test if 2 site spaces are equivalent.
 */
function areSiteSpacesEquivalent(siteSpace1: SiteSpace, siteSpace2: SiteSpace) {
    return siteSpace1.path === siteSpace2.path;
}
