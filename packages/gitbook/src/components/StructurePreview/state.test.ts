import { describe, expect, it } from 'bun:test';

import { languages } from '@/intl/translations';
import { defaultCustomization } from '@/lib/utils';
import { TranslationLanguage } from '@gitbook/api';

import { encodePreviewSiteSections, getPreviewVariants, isStructurePreviewMessage } from './state';
import type { StructurePreviewSnapshot } from './types';

function createSnapshot(
    overrides: Partial<StructurePreviewSnapshot> = {}
): StructurePreviewSnapshot {
    const siteSpace = {
        id: 'site-space-1',
        title: 'Docs',
        path: '',
        default: true,
        hidden: false,
        urls: {},
        space: {
            id: 'space-1',
            revision: 'revision-1',
            language: 'en',
        },
    };

    return {
        site: {
            id: 'site-1',
            title: 'Acme Docs',
        },
        customization: defaultCustomization(),
        structure: {
            type: 'siteSpaces',
            structure: [siteSpace],
        },
        siteSpace,
        siteSpaces: [siteSpace],
        visibleSiteSpaces: [siteSpace],
        sections: null,
        visibleSections: null,
        revision: {
            pages: [],
            tags: [],
        },
        icons: {
            large: {
                light: '/~gitbook/icon?size=large&theme=light',
                dark: '/~gitbook/icon?size=large&theme=dark',
            },
        },
        ...overrides,
    } as StructurePreviewSnapshot;
}

describe('structure preview state', () => {
    it('validates full snapshot update messages', () => {
        const snapshot = createSnapshot();

        expect(
            isStructurePreviewMessage({
                type: 'gitbook.structure.update',
                payload: snapshot,
            })
        ).toBe(true);
        expect(isStructurePreviewMessage({ type: 'gitbook.structure.update' })).toBe(false);
        expect(isStructurePreviewMessage({ type: 'other', payload: snapshot })).toBe(false);
    });

    it('encodes section structures with inert URLs', () => {
        const section = {
            object: 'site-section',
            id: 'section-1',
            title: 'Guides',
            localizedTitle: { fr: 'Guides FR' },
            description: 'Learn',
            path: 'guides',
            default: true,
            siteSpaces: [],
            urls: {},
        };
        const snapshot = createSnapshot({
            locale: 'fr',
            sections: {
                list: [
                    {
                        object: 'site-section-group',
                        id: 'group-1',
                        title: 'Products',
                        children: [section],
                    },
                ],
                current: section,
            },
        } as unknown as Partial<StructurePreviewSnapshot>);

        const encoded = encodePreviewSiteSections(snapshot);

        expect(encoded?.current.title).toBe('Guides FR');
        expect(encoded?.current.url).toBe('#');
        expect(encoded?.list[0]?.object).toBe('site-section-group');
    });

    it('categorizes translation variants like the rendered header', () => {
        const currentSiteSpace = {
            id: 'v15-it',
            title: 'v15',
            path: '',
            default: false,
            hidden: false,
            urls: {},
            space: {
                id: 'space-v15-it',
                revision: 'revision-v15-it',
                language: TranslationLanguage.It,
            },
        };
        const siteSpaces = [
            { id: 'v20-en', title: 'v20', language: TranslationLanguage.En },
            { id: 'v20-fr', title: 'v20', language: TranslationLanguage.Fr },
            { id: 'v20-it', title: 'v20', language: TranslationLanguage.It },
            { id: 'v15-en', title: 'v15', language: TranslationLanguage.En },
            { id: 'v15-fr', title: 'v15', language: TranslationLanguage.Fr },
            currentSiteSpace,
        ].map((siteSpace) =>
            'space' in siteSpace
                ? siteSpace
                : {
                      id: siteSpace.id,
                      title: siteSpace.title,
                      path: '',
                      default: false,
                      hidden: false,
                      urls: {},
                      space: {
                          id: `space-${siteSpace.id}`,
                          revision: `revision-${siteSpace.id}`,
                          language: siteSpace.language,
                      },
                  }
        );
        const snapshot = createSnapshot({
            locale: TranslationLanguage.It,
            siteSpace: currentSiteSpace,
            siteSpaces,
            visibleSiteSpaces: siteSpaces,
        } as unknown as Partial<StructurePreviewSnapshot>);

        const variants = getPreviewVariants(snapshot);

        expect(variants.generic.map((space) => space.id)).toEqual(['v20-it', 'v15-it']);
        expect(
            variants.translations.map((space) => ({ id: space.id, title: space.title }))
        ).toEqual([
            { id: 'v15-en', title: languages.en.language },
            { id: 'v15-fr', title: languages.fr.language },
            { id: 'v15-it', title: languages.it.language },
        ]);
    });
});
