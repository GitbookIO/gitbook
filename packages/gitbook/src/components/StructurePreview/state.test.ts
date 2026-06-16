import { describe, expect, it } from 'bun:test';

import { defaultCustomization } from '@/lib/utils';

import { encodePreviewSiteSections, isStructurePreviewMessage } from './state';
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
});
