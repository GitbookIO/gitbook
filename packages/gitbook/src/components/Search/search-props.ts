import type { SiteExternalLink, SiteSection, SiteSectionGroup, SiteSpace } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { getLocalizedTitle } from '@/lib/sites';

export type SearchSection = Pick<SiteSection, 'id' | 'icon' | 'object'> & {
    title: string;
    siteSpaceIds: string[];
};

export type SearchSectionGroup = Pick<SiteSectionGroup, 'id' | 'icon' | 'object'> & {
    title: string;
    children: SearchSectionItem[];
};

export type SearchSectionItem = SearchSection | SearchSectionGroup;

export interface SearchBaseProps {
    asEmbeddable?: boolean;
    siteSpace: SiteSpace;
    siteSpaces: readonly SiteSpace[];
    withSections: boolean;
    section?: SearchSection;
    sections: SearchSectionItem[];
    withVariants: boolean;
    withSiteVariants: boolean;
    indexURL: string;
    searchURL: string;
}

export function getSearchBaseProps(context: GitBookSiteContext): SearchBaseProps {
    const { siteSpace, visibleSections, visibleSiteSpaces } = context;
    const sections = visibleSections ? encodeSearchSections(context, visibleSections.list) : [];
    const section = visibleSections
        ? findSearchSection(sections, visibleSections.current.id)
        : undefined;

    return {
        searchURL: context.linker.toPathInSpace('~gitbook/search'),
        section,
        sections,
        siteSpace,
        siteSpaces: visibleSiteSpaces,
        withSections: countSearchSections(sections) > 1,
        withSiteVariants:
            visibleSections?.list.some(
                (section) => section.object === 'site-section' && section.siteSpaces.length > 1
            ) ?? false,
        indexURL: context.linker.toPathInSite('~gitbook/site-index'),
        withVariants: visibleSiteSpaces.length > 1,
    };
}

function encodeSearchSections(
    context: GitBookSiteContext,
    items: (SiteSection | SiteSectionGroup | SiteExternalLink)[]
): SearchSectionItem[] {
    const sections: SearchSectionItem[] = [];

    for (const item of items) {
        switch (item.object) {
            case 'site-section':
                const languageCompatibleSiteSpaces = item.siteSpaces.filter(
                    (candidate) =>
                        !context.siteSpace.space.language ||
                        !candidate.space.language ||
                        candidate.space.language === context.siteSpace.space.language
                );
                const defaultLanguage = item.siteSpaces.find((candidate) => candidate.default)
                    ?.space.language;
                const fallbackSiteSpaces = defaultLanguage
                    ? item.siteSpaces.filter(
                          (candidate) =>
                              !candidate.space.language ||
                              candidate.space.language === defaultLanguage
                      )
                    : item.siteSpaces;
                sections.push({
                    id: item.id,
                    icon: item.icon,
                    object: item.object,
                    title: getLocalizedTitle(item, context.locale),
                    siteSpaceIds: (languageCompatibleSiteSpaces.length > 0
                        ? languageCompatibleSiteSpaces
                        : fallbackSiteSpaces
                    ).map((candidate) => candidate.id),
                });
                break;
            case 'site-section-group':
                sections.push({
                    id: item.id,
                    icon: item.icon,
                    object: item.object,
                    title: getLocalizedTitle(item, context.locale),
                    children: encodeSearchSections(context, item.children),
                });
                break;
            case 'site-external-link':
                break;
        }
    }

    return sections;
}

export function findSearchSection(
    items: SearchSectionItem[],
    sectionId: string
): SearchSection | undefined {
    for (const item of items) {
        if (item.object === 'site-section') {
            if (item.id === sectionId) {
                return item;
            }
        } else {
            const section = findSearchSection(item.children, sectionId);
            if (section) {
                return section;
            }
        }
    }

    return undefined;
}

function countSearchSections(items: SearchSectionItem[]): number {
    return items.reduce(
        (count, item) =>
            count + (item.object === 'site-section' ? 1 : countSearchSections(item.children)),
        0
    );
}
