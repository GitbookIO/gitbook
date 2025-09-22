import type { GitBookSiteContext, SiteSections } from '@/lib/context';
import { getSectionURL, getSiteSpaceURL } from '@/lib/sites';
import type { SiteSection, SiteSectionGroup, SiteSpace } from '@gitbook/api';
import assertNever from 'assert-never';

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
    children: (ClientSiteSection | ClientSiteSectionGroup)[];
};

/**
 * Encode the list of site sections into the data to be rendered in the client.
 */
export function encodeClientSiteSections(context: GitBookSiteContext, sections: SiteSections) {
    const { list, current } = sections;

    const clientSections: (ClientSiteSection | ClientSiteSectionGroup)[] = [];

    for (const item of list) {
        switch (item.object) {
            case 'site-section-group': {
                const children = encodeChildren(context, item.children);

                // Skip empty groups
                if (children.length === 0) {
                    continue;
                }

                clientSections.push({
                    id: item.id,
                    title: item.title,
                    icon: item.icon,
                    object: item.object,
                    children,
                });
                continue;
            }
            case 'site-section': {
                clientSections.push(encodeSection(context, item));
                continue;
            }
            default:
                assertNever(item, 'Unknown site section object type');
        }
    }

    return {
        list: clientSections,
        current: encodeSection(context, current),
    };
}

function encodeChildren(
    context: GitBookSiteContext,
    children: (SiteSection | SiteSectionGroup)[]
): (ClientSiteSection | ClientSiteSectionGroup)[] {
    const clientChildren: (ClientSiteSection | ClientSiteSectionGroup)[] = [];

    for (const child of children) {
        switch (child.object) {
            case 'site-section': {
                clientChildren.push(encodeSection(context, child));
                break;
            }
            case 'site-section-group': {
                const nestedChildren = encodeChildren(context, child.children);

                // Skip empty groups
                if (nestedChildren.length === 0) {
                    continue;
                }

                clientChildren.push({
                    id: child.id,
                    title: child.title,
                    icon: child.icon,
                    object: child.object,
                    children: nestedChildren,
                });
                break;
            }
            default:
                assertNever(child, 'Unknown site section object type');
        }
    }

    return clientChildren;
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
 * 2. If there are site spaces with the same language as the current, filter by language.
 * 3. If a site space has the same path as the current one, return it.
 * 4. Otherwise, return the default first language match.
 * 5. Otherwise, return the default one.
 */
function findBestTargetURL(context: GitBookSiteContext, section: SiteSection) {
    const { siteSpace: currentSiteSpace } = context;

    if (section.siteSpaces.length === 1 || currentSiteSpace.default) {
        return getSectionURL(context, section);
    }

    const possibleMatches =
        section.siteSpaces.filter((siteSpace) =>
            areSiteSpacesSameLanguage(siteSpace, currentSiteSpace)
        ) ?? section.siteSpaces;

    const bestMatch =
        possibleMatches.find((siteSpace) => areSiteSpacesEquivalent(siteSpace, currentSiteSpace)) ??
        possibleMatches[0];

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

function areSiteSpacesSameLanguage(siteSpace1: SiteSpace, siteSpace2: SiteSpace) {
    return siteSpace1.space.language === siteSpace2.space.language;
}
