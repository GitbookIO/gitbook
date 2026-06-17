import { describe, expect, it } from 'bun:test';

import { getStructurePreviewSnapshot } from '@/app/sites/dynamic/[mode]/[siteURL]/[siteData]/~gitbook/structure/snapshot';
import { languages } from '@/intl/translations';
import type { GitBookSiteContext } from '@/lib/context';
import { defaultCustomization, findSectionInGroup } from '@/lib/utils';
import { SiteSocialAccountPlatform, TranslationLanguage } from '@gitbook/api';

import {
    isStructurePreviewMessage,
    isStructurePreviewNavigationMessage,
    selectStructurePreviewSection,
} from './state';

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
    it('validates partial preview update messages without revision data', () => {
        const snapshot = getStructurePreviewSnapshot(createContext());
        const update = {
            sections: snapshot.sections,
            variants: snapshot.variants,
            siteSpace: snapshot.siteSpace,
        };

        expect(
            isStructurePreviewMessage({
                type: 'gitbook.structure.update',
                payload: update,
            })
        ).toBe(true);
        expect(
            isStructurePreviewMessage({
                type: 'gitbook.structure.update',
                payload: { sections: snapshot.sections },
            })
        ).toBe(true);
        expect('revision' in snapshot).toBe(false);
        expect('structure' in snapshot).toBe(false);
        expect('siteSpaces' in snapshot).toBe(false);
        expect('visibleSiteSpaces' in snapshot).toBe(false);
        expect(isStructurePreviewMessage({ type: 'gitbook.structure.update' })).toBe(false);
        expect(
            isStructurePreviewMessage({
                type: 'gitbook.structure.update',
                payload: snapshot,
            })
        ).toBe(false);
        expect(
            isStructurePreviewMessage({
                type: 'gitbook.structure.update',
                payload: { site: snapshot.site },
            })
        ).toBe(false);
        expect(isStructurePreviewMessage({ type: 'other', payload: snapshot })).toBe(false);
        expect(
            isStructurePreviewMessage({
                type: 'gitbook.structure.navigate',
                payload: { sectionId: 'section-1' },
            })
        ).toBe(false);
    });

    it('validates preview navigation messages', () => {
        expect(
            isStructurePreviewNavigationMessage({
                type: 'gitbook.structure.navigate',
                payload: { sectionId: 'section-1' },
            })
        ).toBe(true);
        expect(isStructurePreviewNavigationMessage({ type: 'gitbook.structure.navigate' })).toBe(
            false
        );
        expect(
            isStructurePreviewNavigationMessage({
                type: 'gitbook.structure.navigate',
                payload: { sectionId: 1 },
            })
        ).toBe(false);
        expect(
            isStructurePreviewNavigationMessage({
                type: 'gitbook.structure.update',
                payload: { sectionId: 'section-1' },
            })
        ).toBe(false);
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

    it('selects a top-level section in the local snapshot', () => {
        const snapshot = createSnapshotWithSections();
        const nextSnapshot = selectStructurePreviewSection(snapshot, 'reference');

        expect(nextSnapshot).not.toBe(snapshot);
        expect(nextSnapshot.sections?.current.id).toBe('reference');
        expect(nextSnapshot.sections?.current.title).toBe('Reference');
    });

    it('selects a nested section in the local snapshot', () => {
        const snapshot = createSnapshotWithSections();
        const nextSnapshot = selectStructurePreviewSection(snapshot, 'api');
        const currentSection = nextSnapshot.sections?.current;
        const group = nextSnapshot.sections?.list[1];

        expect(currentSection?.id).toBe('api');
        expect(group?.object).toBe('site-section-group');
        if (!currentSection || group?.object !== 'site-section-group') {
            throw new Error('Expected a nested section inside a section group');
        }

        expect(findSectionInGroup(group, currentSection.id)?.id).toBe('api');
    });

    it('keeps the current snapshot when selecting an unknown section', () => {
        const snapshot = createSnapshotWithSections();
        const nextSnapshot = selectStructurePreviewSection(snapshot, 'missing');

        expect(nextSnapshot).toBe(snapshot);
        expect(nextSnapshot.sections?.current.id).toBe('intro');
    });

    it('keeps snapshots without sections unchanged', () => {
        const snapshot = getStructurePreviewSnapshot(createContext());
        const nextSnapshot = selectStructurePreviewSection(snapshot, 'reference');

        expect(nextSnapshot).toBe(snapshot);
        expect(nextSnapshot.sections).toBeNull();
    });
});

function createSnapshotWithSections() {
    const intro = createSection('intro', 'Intro');
    const reference = createSection('reference', 'Reference');
    const api = createSection('api', 'API');

    return getStructurePreviewSnapshot(
        createContext({
            sections: {
                list: [
                    intro,
                    {
                        object: 'site-section-group',
                        id: 'developers',
                        title: 'Developers',
                        children: [api],
                    },
                    reference,
                ],
                current: intro,
            },
        } as unknown as Partial<GitBookSiteContext>)
    );
}

function createSection(id: string, title: string) {
    return {
        object: 'site-section',
        id,
        title,
        description: '',
        path: id,
        default: false,
        siteSpaces: [],
        urls: {},
    };
}
