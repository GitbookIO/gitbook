import type { GitBookSiteContext, SiteSections } from '@/lib/context';
import { toEmbeddableLinkForPublishedContent } from '@/lib/embeddable-linker';
import {
    getLocalizedDescription,
    getLocalizedTitle,
    getSectionURL,
    getSiteSpaceURL,
} from '@/lib/sites';
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
export function encodeClientSiteSections(
    context: GitBookSiteContext,
    sections: SiteSections,
    options?: { asEmbeddable?: boolean }
) {
    const { list, current } = sections;
    const currentLanguage = context.locale;
    const asEmbeddable = Boolean(options?.asEmbeddable);

    const clientSections: (ClientSiteSection | ClientSiteSectionGroup)[] = [];

    for (const item of list) {
        switch (item.object) {
            case 'site-section-group': {
                const children = encodeChildren(context, item.children, asEmbeddable);

                // Skip empty groups
                if (children.length === 0) {
                    continue;
                }

                clientSections.push({
                    id: item.id,
                    title: getLocalizedTitle(item, currentLanguage),
                    icon: item.icon,
                    object: item.object,
                    children,
                });
                continue;
            }
            case 'site-section': {
                clientSections.push(encodeSection(context, item, asEmbeddable));
                continue;
            }
            default:
                assertNever(item, 'Unknown site section object type');
        }
    }

    return {
        list: clientSections,
        current: encodeSection(context, current, asEmbeddable),
    };
}

function encodeChildren(
    context: GitBookSiteContext,
    children: (SiteSection | SiteSectionGroup)[],
    asEmbeddable: boolean
): (ClientSiteSection | ClientSiteSectionGroup)[] {
    const clientChildren: (ClientSiteSection | ClientSiteSectionGroup)[] = [];
    const currentLanguage = context.locale;

    for (const child of children) {
        switch (child.object) {
            case 'site-section': {
                clientChildren.push(encodeSection(context, child, asEmbeddable));
                break;
            }
            case 'site-section-group': {
                const nestedChildren = encodeChildren(context, child.children, asEmbeddable);

                // Skip empty groups
                if (nestedChildren.length === 0) {
                    continue;
                }

                clientChildren.push({
                    id: child.id,
                    title: getLocalizedTitle(child, currentLanguage),
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

function encodeSection(context: GitBookSiteContext, section: SiteSection, asEmbeddable: boolean) {
    const currentLanguage = context.locale;
    return {
        id: section.id,
        title: getLocalizedTitle(section, currentLanguage),
        description: getLocalizedDescription(section, currentLanguage),
        icon: section.icon,
        object: section.object,
        url: findBestTargetURL(context, section, asEmbeddable),
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
function findBestTargetURL(
    context: GitBookSiteContext,
    section: SiteSection,
    asEmbeddable: boolean
) {
    const { siteSpace: currentSiteSpace } = context;

    if (section.siteSpaces.length === 1 || currentSiteSpace.default) {
        return getTargetURLForSection(context, section, asEmbeddable);
    }

    const possibleMatches =
        section.siteSpaces.filter((siteSpace) =>
            areSiteSpacesSameLanguage(siteSpace, currentSiteSpace)
        ) ?? section.siteSpaces;

    const bestMatch =
        possibleMatches.find((siteSpace) => areSiteSpacesEquivalent(siteSpace, currentSiteSpace)) ??
        possibleMatches[0];

    if (bestMatch) {
        return getTargetURLForSiteSpace(context, bestMatch, asEmbeddable);
    }

    return getTargetURLForSection(context, section, asEmbeddable);
}

function getTargetURLForSection(
    context: GitBookSiteContext,
    section: SiteSection,
    asEmbeddable: boolean
) {
    if (asEmbeddable && section.urls.published) {
        return toEmbeddableLinkForPublishedContent(context.linker, section.urls.published, '');
    }

    return getSectionURL(context, section);
}

function getTargetURLForSiteSpace(
    context: GitBookSiteContext,
    siteSpace: SiteSpace,
    asEmbeddable: boolean
) {
    if (asEmbeddable && siteSpace.urls.published) {
        return toEmbeddableLinkForPublishedContent(context.linker, siteSpace.urls.published, '');
    }

    return getSiteSpaceURL(context, siteSpace);
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
