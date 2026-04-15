import type { GitBookSiteContext } from '@/lib/context';
import type { SiteSection, SiteSpace } from '@gitbook/api';
import { encodeClientSiteSections } from '../SiteSections';

export interface SearchBaseProps {
    asEmbeddable?: boolean;
    siteSpace: SiteSpace;
    siteSpaces: ReadonlyArray<SiteSpace>;
    withSections: boolean;
    section?: Pick<SiteSection, 'title' | 'icon'>;
    withVariants: boolean;
    withSiteVariants: boolean;
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
        withSections: Boolean(visibleSections && visibleSections.list.length > 1),
        withSiteVariants:
            visibleSections?.list.some(
                (section) => section.object === 'site-section' && section.siteSpaces.length > 1
            ) ?? false,
        withVariants: visibleSiteSpaces.length > 1,
    };
}
