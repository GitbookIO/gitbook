import type { SiteSocialAccountPlatform } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

import type { ClientSiteSection, ClientSiteSectionGroup } from '../SiteSections';
import type {
    StructurePreviewMessage,
    StructurePreviewNavigationMessage,
    StructurePreviewSnapshot,
    StructurePreviewUpdate,
} from './types';

const STRUCTURE_PREVIEW_UPDATE_KEYS = ['sections', 'siteSpace', 'variants'] as const;

export function isStructurePreviewMessage(value: unknown): value is StructurePreviewMessage {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const message = value as Partial<StructurePreviewMessage>;
    return message.type === 'gitbook.structure.update' && isStructurePreviewUpdate(message.payload);
}

export function isStructurePreviewNavigationMessage(
    value: unknown
): value is StructurePreviewNavigationMessage {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const message = value as Partial<StructurePreviewNavigationMessage>;
    const payload = message.payload as Partial<StructurePreviewNavigationMessage['payload']>;
    return message.type === 'gitbook.structure.navigate' && typeof payload?.sectionId === 'string';
}

export function isStructurePreviewUpdate(value: unknown): value is StructurePreviewUpdate {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const update = value as Partial<StructurePreviewUpdate>;
    const keys = Object.keys(update);
    if (
        keys.length === 0 ||
        keys.some(
            (key) =>
                !STRUCTURE_PREVIEW_UPDATE_KEYS.includes(
                    key as (typeof STRUCTURE_PREVIEW_UPDATE_KEYS)[number]
                )
        )
    ) {
        return false;
    }

    return (
        (!('sections' in update) || isStructurePreviewSections(update.sections)) &&
        (!('siteSpace' in update) || isStructurePreviewSiteSpace(update.siteSpace)) &&
        (!('variants' in update) || isStructurePreviewVariants(update.variants))
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

function isStructurePreviewSections(value: unknown): value is StructurePreviewSnapshot['sections'] {
    if (value === null) {
        return true;
    }

    if (!value || typeof value !== 'object') {
        return false;
    }

    const sections = value as Partial<NonNullable<StructurePreviewSnapshot['sections']>>;
    return (
        Array.isArray(sections.list) &&
        sections.list.every(isStructurePreviewSectionItem) &&
        isStructurePreviewSection(sections.current)
    );
}

function isStructurePreviewSectionItem(
    value: unknown
): value is ClientSiteSection | ClientSiteSectionGroup {
    return isStructurePreviewSection(value) || isStructurePreviewSectionGroup(value);
}

function isStructurePreviewSection(value: unknown): value is ClientSiteSection {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const section = value as Partial<ClientSiteSection>;
    return (
        section.object === 'site-section' &&
        typeof section.id === 'string' &&
        typeof section.title === 'string' &&
        typeof section.url === 'string'
    );
}

function isStructurePreviewSectionGroup(value: unknown): value is ClientSiteSectionGroup {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const group = value as Partial<ClientSiteSectionGroup>;
    return (
        group.object === 'site-section-group' &&
        typeof group.id === 'string' &&
        typeof group.title === 'string' &&
        Array.isArray(group.children) &&
        group.children.every(isStructurePreviewSectionItem)
    );
}

function isStructurePreviewSiteSpace(
    value: unknown
): value is StructurePreviewSnapshot['siteSpace'] {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const siteSpace = value as Partial<StructurePreviewSnapshot['siteSpace']>;
    return (
        typeof siteSpace.id === 'string' &&
        typeof siteSpace.title === 'string' &&
        typeof siteSpace.path === 'string'
    );
}

function isStructurePreviewVariants(value: unknown): value is StructurePreviewSnapshot['variants'] {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const variants = value as Partial<StructurePreviewSnapshot['variants']>;
    return (
        Array.isArray(variants.generic) &&
        variants.generic.every(isPreviewDropdownSpace) &&
        Array.isArray(variants.translations) &&
        variants.translations.every(isPreviewDropdownSpace)
    );
}

function isPreviewDropdownSpace(
    value: unknown
): value is StructurePreviewSnapshot['variants']['generic'][number] {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const siteSpace = value as Partial<StructurePreviewSnapshot['variants']['generic'][number]>;
    return (
        typeof siteSpace.id === 'string' &&
        typeof siteSpace.title === 'string' &&
        typeof siteSpace.isActive === 'boolean'
    );
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
