import type {
    CustomizationContentLink,
    CustomizationHeaderItem,
    SiteSection,
    SiteSectionGroup,
    SiteSpace,
} from '@gitbook/api';
import assertNever from 'assert-never';

import type {
    ClientSiteSection,
    ClientSiteSectionGroup,
    ClientSiteSections,
} from '@/components/SiteSections';
import { categorizeVariants } from '@/components/SpaceLayout/categorizeVariants';
import type { StructurePreviewSnapshot } from '@/components/StructurePreview';
import type { PreviewContentLink, PreviewHeaderLink } from '@/components/StructurePreview/types';
import type { GitBookSiteContext, SiteSections } from '@/lib/context';
import { getLocalizedDescription, getLocalizedTitle } from '@/lib/sites';

export function getStructurePreviewSnapshot(context: GitBookSiteContext): StructurePreviewSnapshot {
    const variants = categorizeVariants(context);
    const sections = context.visibleSections ?? context.sections;

    return {
        site: {
            title: context.site.title,
        },
        locale: context.locale,
        customization: encodePreviewCustomization(context),
        siteSpace: encodePreviewSiteSpace(context.siteSpace, context),
        variants: {
            generic: variants.generic.map((siteSpace) =>
                encodePreviewDropdownSpace(siteSpace, context)
            ),
            translations: variants.translations.map((siteSpace) =>
                encodePreviewDropdownSpace(siteSpace, context)
            ),
        },
        sections: sections ? encodePreviewSiteSections(context, sections) : null,
        icons: {
            large: {
                light: context.linker.toPathInSpace('~gitbook/icon?size=large&theme=light'),
                dark: context.linker.toPathInSpace('~gitbook/icon?size=large&theme=dark'),
            },
        },
    };
}

function encodePreviewCustomization(
    context: GitBookSiteContext
): StructurePreviewSnapshot['customization'] {
    const { customization, locale } = context;

    return {
        styling: {
            search: customization.styling.search,
        },
        favicon:
            'emoji' in customization.favicon && customization.favicon.emoji
                ? { emoji: customization.favicon.emoji }
                : {},
        header: {
            preset: customization.header.preset,
            logo: customization.header.logo
                ? {
                      light: customization.header.logo.light,
                      dark: customization.header.logo.dark,
                  }
                : undefined,
            links: customization.header.links.map((link) => encodePreviewHeaderLink(link, locale)),
        },
        ai: {
            mode: customization.ai.mode,
        },
        trademark: {
            enabled: customization.trademark.enabled,
        },
        socialAccounts: customization.socialAccounts
            .filter((account) => account.display.header === true)
            .map((account) => ({
                platform: account.platform,
                handle: account.handle,
            })),
    };
}

function encodePreviewHeaderLink(
    link: CustomizationHeaderItem,
    locale: GitBookSiteContext['locale']
): PreviewHeaderLink {
    return {
        title: getLocalizedTitle(link, locale),
        style: link.style,
        hasTarget: Boolean(link.to),
        links: link.links.map((subLink) => encodePreviewContentLink(subLink, locale)),
    };
}

function encodePreviewContentLink(
    link: CustomizationContentLink,
    locale: GitBookSiteContext['locale']
): PreviewContentLink {
    return {
        title: getLocalizedTitle(link, locale),
        hasTarget: Boolean(link.to),
    };
}

function encodePreviewSiteSpace(
    siteSpace: SiteSpace,
    context: GitBookSiteContext
): StructurePreviewSnapshot['siteSpace'] {
    return {
        id: siteSpace.id,
        title: getLocalizedTitle(siteSpace, context.locale),
        path: siteSpace.path,
    };
}

function encodePreviewDropdownSpace(
    siteSpace: SiteSpace,
    context: GitBookSiteContext
): StructurePreviewSnapshot['variants']['generic'][number] {
    return {
        id: siteSpace.id,
        title: getLocalizedTitle(siteSpace, context.locale),
        isActive: siteSpace.id === context.siteSpace.id,
    };
}

export function encodePreviewSiteSections(
    context: Pick<GitBookSiteContext, 'locale'>,
    sections: SiteSections
): ClientSiteSections {
    return {
        list: sections.list.flatMap((item) => encodePreviewSectionItem(context, item)),
        current: encodePreviewSection(context, sections.current),
    };
}

function encodePreviewSectionItem(
    context: Pick<GitBookSiteContext, 'locale'>,
    item: SiteSection | SiteSectionGroup
): (ClientSiteSection | ClientSiteSectionGroup)[] {
    switch (item.object) {
        case 'site-section':
            return [encodePreviewSection(context, item)];
        case 'site-section-group': {
            const children = item.children.flatMap((child) =>
                encodePreviewSectionItem(context, child)
            );
            if (children.length === 0) {
                return [];
            }

            return [
                {
                    id: item.id,
                    title: getLocalizedTitle(item, context.locale),
                    icon: item.icon,
                    object: item.object,
                    children,
                },
            ];
        }
        default:
            assertNever(item);
    }
}

function encodePreviewSection(
    context: Pick<GitBookSiteContext, 'locale'>,
    section: SiteSection
): ClientSiteSection {
    return {
        id: section.id,
        title: getLocalizedTitle(section, context.locale),
        description: getLocalizedDescription(section, context.locale),
        icon: section.icon,
        object: section.object,
        url: '#',
    };
}
