import type {
    RevisionPage,
    RevisionTag,
    SiteCustomizationSettings,
    SiteSpace,
    SiteStructure,
    TranslationLanguage,
} from '@gitbook/api';

import type { SiteSections } from '@/lib/context';

export type StructurePreviewViewportMode = 'auto' | 'desktop' | 'mobile';

export type StructurePreviewSnapshot = {
    site: {
        id: string;
        title: string;
        proxyOrigin?: string;
    };
    contextId?: string;
    locale?: TranslationLanguage;
    customization: SiteCustomizationSettings;
    structure: SiteStructure;
    siteSpace: SiteSpace;
    siteSpaces: SiteSpace[];
    visibleSiteSpaces: SiteSpace[];
    sections: SiteSections | null;
    visibleSections: SiteSections | null;
    revision: {
        pages: RevisionPage[];
        tags: RevisionTag[];
    };
    icons: {
        large: {
            light: string;
            dark: string;
        };
    };
    viewportMode?: StructurePreviewViewportMode;
};

export type StructurePreviewMessage = {
    type: 'gitbook.structure.update';
    payload: StructurePreviewSnapshot;
};
