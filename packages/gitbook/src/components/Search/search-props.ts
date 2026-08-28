import type { SiteSection, SiteSpace } from '@gitbook/api';

import { encodeClientSiteSections, hasMultipleSiteSections } from '../SiteSections';
import type { GitBookSiteContext } from '@/lib/context';

export interface SearchBaseProps {
    asEmbeddable?: boolean;
    siteSpace: SiteSpace;
    siteSpaces: readonly SiteSpace[];
    withSections: boolean;
    section?: Pick<SiteSection, 'title' | 'icon'>;
    withVariants: boolean;
    withSiteVariants: boolean;
    indexURL: string;
    searchURL: string;
}

export function getSearchBaseProps(context: GitBookSiteContext): SearchBaseProps {
    const { siteSpace, visibleSections, visibleSiteSpaces } = context;

    return {
        searchURL: context.linker.toPathInSpace('~gitbook/search'),
        section: visibleSections
            ? encodeClientSiteSections(context, visibleSections).current
            : undefined,
        siteSpace,
        siteSpaces: visibleSiteSpaces,
        withSections: hasMultipleSiteSections(visibleSections),
        withSiteVariants:
            visibleSections?.list.some(
                (section) => section.object === 'site-section' && section.siteSpaces.length > 1
            ) ?? false,
        indexURL: context.linker.toPathInSite('~gitbook/site-index'),
        withVariants: visibleSiteSpaces.length > 1,
    };
}
