import { describe, expect, it } from 'bun:test';

import { getStructurePreviewSnapshot } from '@/app/sites/dynamic/[mode]/[siteURL]/[siteData]/~gitbook/structure/snapshot';
import { languages } from '@/intl/translations';
import type { GitBookSiteContext } from '@/lib/context';
import { defaultCustomization } from '@/lib/utils';
import { SiteSocialAccountPlatform, TranslationLanguage } from '@gitbook/api';

import { isStructurePreviewMessage } from './state';

function createContext(overrides: Partial<GitBookSiteContext> = {}): GitBookSiteContext {
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
        locale: undefined,
        customization: defaultCustomization(),
        siteSpace,
        siteSpaces: [siteSpace],
        visibleSiteSpaces: [siteSpace],
        sections: null,
        visibleSections: null,
        linker: {
            toPathInSpace: (path: string) => `/space/${path}`,
        },
        ...overrides,
    } as GitBookSiteContext;
}

describe('structure preview state', () => {
    it('validates slim snapshot update messages without revision data', () => {
        const snapshot = getStructurePreviewSnapshot(createContext());

        expect(
            isStructurePreviewMessage({
                type: 'gitbook.structure.update',
                payload: snapshot,
            })
        ).toBe(true);
        expect('revision' in snapshot).toBe(false);
        expect('structure' in snapshot).toBe(false);
        expect('siteSpaces' in snapshot).toBe(false);
        expect('visibleSiteSpaces' in snapshot).toBe(false);
        expect(isStructurePreviewMessage({ type: 'gitbook.structure.update' })).toBe(false);
        expect(isStructurePreviewMessage({ type: 'other', payload: snapshot })).toBe(false);
    });

    it('stores pre-encoded section structures with inert URLs', () => {
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
        const snapshot = getStructurePreviewSnapshot(
            createContext({
                locale: TranslationLanguage.Fr,
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
            } as unknown as Partial<GitBookSiteContext>)
        );

        expect(snapshot.sections?.current.title).toBe('Guides FR');
        expect(snapshot.sections?.current.url).toBe('#');
        expect(snapshot.sections?.list[0]?.object).toBe('site-section-group');
    });

    it('stores precomputed variant groups with slim translation titles', () => {
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
        const snapshot = getStructurePreviewSnapshot(
            createContext({
                locale: TranslationLanguage.It,
                siteSpace: currentSiteSpace,
                siteSpaces,
                visibleSiteSpaces: siteSpaces,
            } as Partial<GitBookSiteContext>)
        );

        expect(snapshot.variants.generic.map((space) => space.id)).toEqual(['v20-it', 'v15-it']);
        expect(
            snapshot.variants.translations.map((space) => ({
                id: space.id,
                title: space.title,
                isActive: space.isActive,
            }))
        ).toEqual([
            { id: 'v15-en', title: languages.en.language, isActive: false },
            { id: 'v15-fr', title: languages.fr.language, isActive: false },
            { id: 'v15-it', title: languages.it.language, isActive: true },
        ]);
    });

    it('stores only header-visible social account fields', () => {
        const customization = defaultCustomization();
        customization.socialAccounts = [
            {
                platform: SiteSocialAccountPlatform.Github,
                handle: 'gitbook',
                display: { header: true, footer: true },
            },
            {
                platform: SiteSocialAccountPlatform.Discord,
                handle: 'hidden',
                display: { header: false, footer: true },
            },
        ];

        const snapshot = getStructurePreviewSnapshot(createContext({ customization }));

        expect(snapshot.customization.socialAccounts).toEqual([
            { platform: SiteSocialAccountPlatform.Github, handle: 'gitbook' },
        ]);
    });
});
