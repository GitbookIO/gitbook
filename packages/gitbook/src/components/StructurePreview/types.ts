import type {
    CustomizationAIMode,
    CustomizationHeaderItem,
    CustomizationHeaderPreset,
    CustomizationSearchStyle,
    SiteSocialAccountPlatform,
    TranslationLanguage,
} from '@gitbook/api';

import type { ClientSiteSections } from '@/components/SiteSections';

export type PreviewHeaderLink = {
    title: string;
    style?: CustomizationHeaderItem['style'];
    hasTarget: boolean;
    links: PreviewContentLink[];
};

export type PreviewContentLink = {
    title: string;
    hasTarget: boolean;
};

export type PreviewDropdownSpace = {
    id: string;
    title: string;
    isActive: boolean;
};

export type StructurePreviewSnapshot = {
    site: {
        title: string;
    };
    locale?: TranslationLanguage;
    customization: {
        styling: {
            search: CustomizationSearchStyle;
        };
        favicon: {
            emoji?: string;
        };
        header: {
            preset: CustomizationHeaderPreset;
            logo?: {
                light: string;
                dark?: string;
            };
            links: PreviewHeaderLink[];
        };
        ai: {
            mode: CustomizationAIMode;
        };
        trademark: {
            enabled: boolean;
        };
        socialAccounts: {
            platform: SiteSocialAccountPlatform;
            handle: string;
        }[];
    };
    siteSpace: {
        id: string;
        title: string;
        path: string;
    };
    variants: {
        generic: PreviewDropdownSpace[];
        translations: PreviewDropdownSpace[];
    };
    sections: ClientSiteSections | null;
    icons: {
        large: {
            light: string;
            dark: string;
        };
    };
};

export type StructurePreviewUpdate = Partial<
    Pick<StructurePreviewSnapshot, 'sections' | 'siteSpace' | 'variants'>
>;

export type StructurePreviewMessage = {
    type: 'gitbook.structure.update';
    payload: StructurePreviewUpdate;
};

export type StructurePreviewNavigationMessage = {
    type: 'gitbook.structure.navigate';
    payload: {
        sectionId: string;
    };
};
