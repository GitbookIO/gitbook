import { getSectionURL, getSiteSpaceURL } from '@/lib/sites';
import type { SiteSection, SiteSectionGroup } from '@gitbook/api';
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
                sections: item.sections.map((section) => encodeSection(context, section)),
            });
        } else {
            clientSections.push(encodeSection(context, item));
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

    const bestMatch = section.siteSpaces.find(
        (siteSpace) => siteSpace.path === currentSiteSpace.path
    );
    if (bestMatch) {
        return getSiteSpaceURL(context, bestMatch);
    }

    return getSectionURL(context, section);
}
