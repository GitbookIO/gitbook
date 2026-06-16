import type {
    ContentRef,
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
import { categorizeVariants } from '@/components/SpaceLayout/categorizeVariants';
import { getLocalizedDescription, getLocalizedTitle } from '@/lib/sites';

import type { StructurePreviewMessage, StructurePreviewSnapshot } from './types';

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

export function getPreviewVariants(snapshot: StructurePreviewSnapshot) {
    return categorizeVariants(snapshot);
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
