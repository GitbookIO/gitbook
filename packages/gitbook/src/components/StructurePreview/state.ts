import type { SiteSocialAccountPlatform } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

import type { ClientSiteSection, ClientSiteSectionGroup } from '../SiteSections';
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
            snapshot.customization?.header &&
            Array.isArray(snapshot.customization.header.links) &&
            snapshot.customization.styling &&
            snapshot.customization.favicon &&
            snapshot.customization.ai &&
            snapshot.customization.trademark &&
            Array.isArray(snapshot.customization.socialAccounts) &&
            snapshot.siteSpace &&
            typeof snapshot.siteSpace.title === 'string' &&
            snapshot.variants &&
            Array.isArray(snapshot.variants.generic) &&
            Array.isArray(snapshot.variants.translations) &&
            snapshot.icons?.large
    );
}

export function selectStructurePreviewSection(
    snapshot: StructurePreviewSnapshot,
    sectionId: string
): StructurePreviewSnapshot {
    const sections = snapshot.sections;
    if (!sections || sections.current.id === sectionId) {
        return snapshot;
    }

    const selectedSection = findPreviewSection(sections.list, sectionId);
    if (!selectedSection) {
        return snapshot;
    }

    return {
        ...snapshot,
        sections: {
            ...sections,
            current: selectedSection,
        },
    };
}

function findPreviewSection(
    items: (ClientSiteSection | ClientSiteSectionGroup)[],
    sectionId: string
): ClientSiteSection | null {
    for (const item of items) {
        if (item.object === 'site-section') {
            if (item.id === sectionId) {
                return item;
            }
            continue;
        }

        const childSection = findPreviewSection(item.children, sectionId);
        if (childSection) {
            return childSection;
        }
    }

    return null;
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
