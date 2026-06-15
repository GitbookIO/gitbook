import { describe, expect, it } from 'bun:test';

import { defaultCustomization } from '@/lib/utils';

import {
    encodePreviewSiteSections,
    encodePreviewTableOfContents,
    getStructurePreviewViewportMode,
    isStructurePreviewMessage,
} from './state';
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

    it('normalizes viewport mode', () => {
        expect(getStructurePreviewViewportMode('desktop')).toBe('desktop');
        expect(getStructurePreviewViewportMode('mobile')).toBe('mobile');
        expect(getStructurePreviewViewportMode('auto')).toBe('auto');
        expect(getStructurePreviewViewportMode(undefined)).toBe('auto');
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

    it('encodes revision pages for the mobile menu without navigable URLs', () => {
        const snapshot = createSnapshot({
            revision: {
                tags: [],
                pages: [
                    {
                        type: 'document',
                        id: 'page-1',
                        title: 'Introduction',
                        path: 'intro',
                        pages: [
                            {
                                type: 'document',
                                id: 'page-2',
                                title: 'Nested',
                                path: 'nested',
                                pages: [],
                            },
                        ],
                    },
                    {
                        type: 'document',
                        id: 'hidden-page',
                        title: 'Hidden',
                        hidden: true,
                        path: 'hidden',
                        pages: [],
                    },
                ],
            },
        } as unknown as Partial<StructurePreviewSnapshot>);

        const encoded = encodePreviewTableOfContents(snapshot);

        expect(encoded).toHaveLength(1);
        expect(encoded[0]).toMatchObject({
            type: 'document',
            title: 'Introduction',
            href: '#',
        });
        const nested = encoded[0]?.type === 'document' ? encoded[0].descendants?.[0] : null;
        expect(nested?.type === 'document' ? nested.href : null).toBe('#');
    });
});
