import type {
    ContentRef,
    RevisionPage,
    RevisionPageTag,
    RevisionTag,
    SiteCustomizationSettings,
    SiteSection,
    SiteSectionGroup,
    SiteSocialAccountPlatform,
} from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import assertNever from 'assert-never';

import type {
    ClientSiteSection,
    ClientSiteSectionGroup,
    ClientSiteSections,
} from '@/components/SiteSections/encodeClientSiteSections';
import type { ClientTOCPage } from '@/components/TableOfContents/encodeClientTableOfContents';
import { getLocalizedDescription, getLocalizedTitle } from '@/lib/sites';
import { resolveTag } from '@/lib/tags';

import type {
    StructurePreviewMessage,
    StructurePreviewSnapshot,
    StructurePreviewViewportMode,
} from './types';

export function isStructurePreviewMessage(value: unknown): value is StructurePreviewMessage {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const message = value as Partial<StructurePreviewMessage>;
    return (
        message.type === 'gitbook.structure.update' && isStructurePreviewSnapshot(message.payload)
    );
}

export function isStructurePreviewSnapshot(value: unknown): value is StructurePreviewSnapshot {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const snapshot = value as Partial<StructurePreviewSnapshot>;
    return Boolean(
        snapshot.site &&
            typeof snapshot.site.title === 'string' &&
            snapshot.customization &&
            snapshot.structure &&
            snapshot.siteSpace &&
            Array.isArray(snapshot.siteSpaces) &&
            Array.isArray(snapshot.visibleSiteSpaces) &&
            snapshot.revision &&
            Array.isArray(snapshot.revision.pages) &&
            Array.isArray(snapshot.revision.tags)
    );
}

export function getStructurePreviewViewportMode(
    mode: StructurePreviewViewportMode | undefined
): StructurePreviewViewportMode {
    return mode === 'desktop' || mode === 'mobile' ? mode : 'auto';
}

export function encodePreviewSiteSections(
    snapshot: StructurePreviewSnapshot
): ClientSiteSections | null {
    const sections = snapshot.visibleSections ?? snapshot.sections;
    if (!sections) {
        return null;
    }

    return {
        list: sections.list.flatMap((item) => encodePreviewSectionItem(snapshot, item)),
        current: encodePreviewSection(snapshot, sections.current),
    };
}

function encodePreviewSectionItem(
    snapshot: StructurePreviewSnapshot,
    item: SiteSection | SiteSectionGroup
): (ClientSiteSection | ClientSiteSectionGroup)[] {
    switch (item.object) {
        case 'site-section': {
            return [encodePreviewSection(snapshot, item)];
        }
        case 'site-section-group': {
            const children = item.children.flatMap((child) =>
                encodePreviewSectionItem(snapshot, child)
            );
            if (children.length === 0) {
                return [];
            }

            return [
                {
                    id: item.id,
                    title: getLocalizedTitle(item, snapshot.locale),
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
    snapshot: StructurePreviewSnapshot,
    section: SiteSection
): ClientSiteSection {
    return {
        id: section.id,
        title: getLocalizedTitle(section, snapshot.locale),
        description: getLocalizedDescription(section, snapshot.locale),
        icon: section.icon,
        object: section.object,
        url: '#',
    };
}

export function encodePreviewTableOfContents(snapshot: StructurePreviewSnapshot): ClientTOCPage[] {
    return encodePreviewPages(
        snapshot.revision.pages,
        snapshot.revision.pages,
        snapshot.revision.tags
    );
}

function encodePreviewPages(
    rootPages: RevisionPage[],
    pages: RevisionPage[],
    tags: RevisionTag[]
): ClientTOCPage[] {
    return pages.flatMap((page): ClientTOCPage[] => {
        if (page.type === 'computed' || page.hidden) {
            return [];
        }

        switch (page.type) {
            case 'document': {
                return [
                    removeUndefined({
                        id: page.id,
                        title: page.linkTitle || page.title,
                        href: '#',
                        emoji: page.emoji,
                        icon: page.icon,
                        pathnames: [],
                        descendants: hasVisibleDescendant(page.pages)
                            ? encodePreviewPages(rootPages, page.pages, tags)
                            : undefined,
                        primaryTag: resolvePrimaryPageTag(page.tags, tags),
                        type: 'document' as const,
                    }),
                ];
            }
            case 'link': {
                return [
                    removeUndefined({
                        id: page.id,
                        title: page.title,
                        href: '#',
                        emoji: page.emoji,
                        icon: page.icon,
                        target: page.target,
                        type: 'link' as const,
                    }),
                ];
            }
            case 'group': {
                return [
                    removeUndefined({
                        id: page.id,
                        title: page.title,
                        emoji: page.emoji,
                        icon: page.icon,
                        descendants: hasVisibleDescendant(page.pages)
                            ? encodePreviewPages(rootPages, page.pages, tags)
                            : undefined,
                        type: 'group' as const,
                    }),
                ];
            }
            default:
                assertNever(page);
        }
    });
}

function hasVisibleDescendant(pages: RevisionPage[]) {
    return pages.some((page) => page.type !== 'computed' && !page.hidden);
}

function resolvePrimaryPageTag(
    pageTags: RevisionPageTag[] | undefined,
    tags: RevisionTag[]
): RevisionTag | undefined {
    if (!pageTags || pageTags.length === 0) {
        return undefined;
    }

    const primary = pageTags.find((tag) => tag.primary);
    if (!primary) {
        return undefined;
    }

    return resolveTag(primary.tag.tag, tags);
}

function removeUndefined<T extends Record<string, unknown>>(object: T): T {
    return Object.fromEntries(
        Object.entries(object).filter(([, value]) => value !== undefined)
    ) as T;
}

export function getPreviewVariants(snapshot: StructurePreviewSnapshot) {
    const siteSpaces =
        snapshot.visibleSiteSpaces.length > 0 ? snapshot.visibleSiteSpaces : snapshot.siteSpaces;
    const currentLanguage = snapshot.locale ?? snapshot.siteSpace.space.language ?? 'en';
    const languages = [...new Set(siteSpaces.map((space) => space.space.language ?? 'en'))];
    const isMultiLanguage = languages.length > 1;

    return {
        generic: isMultiLanguage
            ? siteSpaces.filter(
                  (space) =>
                      space.id === snapshot.siteSpace.id ||
                      (space.space.language ?? 'en') === currentLanguage
              )
            : siteSpaces,
        translations: isMultiLanguage
            ? siteSpaces.filter(
                  (space) =>
                      space.id === snapshot.siteSpace.id ||
                      (space.space.language ?? 'en') !== currentLanguage
              )
            : [],
    };
}

export function getHeaderSocialAccounts(customization: SiteCustomizationSettings) {
    return customization.socialAccounts.filter((account) => account.display.header === true);
}

export const SOCIAL_PLATFORM_ICONS: Partial<Record<SiteSocialAccountPlatform, IconName>> = {
    twitter: 'x-twitter',
    instagram: 'instagram',
    facebook: 'facebook',
    linkedin: 'linkedin',
    github: 'github',
    discord: 'discord',
    slack: 'slack',
    youtube: 'youtube',
    tiktok: 'tiktok',
    reddit: 'reddit',
    bluesky: 'bluesky',
    mastodon: 'mastodon',
    threads: 'threads',
    medium: 'medium',
};

export function getContentRefKey(ref: ContentRef | null | undefined) {
    if (!ref) {
        return 'empty';
    }

    return JSON.stringify(ref);
}
