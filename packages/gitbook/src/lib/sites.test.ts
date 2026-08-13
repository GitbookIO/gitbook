import { describe, expect, it } from 'bun:test';
import type { RevisionPageDocument, SiteSection, SiteSpace, SiteStructure } from '@gitbook/api';
import { TranslationLanguage } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { createLinker } from './links';
import {
    filterSiteSpacesByLocale,
    getFallbackSiteSpacePath,
    getLinkerForSiteSpace,
    getSiteSpacePagePaths,
    resolveSiteSpaceCustomHomePage,
} from './sites';

function makeSiteSpace(language: TranslationLanguage | undefined): SiteSpace {
    return { space: { language } } as unknown as SiteSpace;
}

describe('filterSiteSpacesByLocale', () => {
    it('returns all spaces on a single-language site', () => {
        const spaces = [makeSiteSpace(undefined), makeSiteSpace(undefined)];
        expect(filterSiteSpacesByLocale(spaces, TranslationLanguage.En)).toEqual(spaces);
    });

    it('filters by locale on a multi-language site', () => {
        const en = makeSiteSpace(TranslationLanguage.En);
        const fr = makeSiteSpace(TranslationLanguage.Fr);
        expect(filterSiteSpacesByLocale([en, fr], TranslationLanguage.Fr)).toEqual([fr]);
    });

    it('treats undefined language as English', () => {
        const undefinedLanguage = makeSiteSpace(undefined);
        const en = makeSiteSpace(TranslationLanguage.En);
        expect(filterSiteSpacesByLocale([undefinedLanguage, en], TranslationLanguage.En)).toEqual([
            undefinedLanguage,
            en,
        ]);
    });
});

describe('custom site-space home page', () => {
    const pages = [
        {
            id: 'default',
            type: 'document',
            path: 'introduction',
            pages: [],
        },
        {
            id: 'custom',
            type: 'document',
            path: 'guides/getting-started',
            pages: [],
        },
    ] as unknown as RevisionPageDocument[];

    function makeTargetedSiteSpace(pageId: string): SiteSpace {
        return { pageId } as unknown as SiteSpace;
    }

    it('resolves a custom home page from the current revision', () => {
        expect(
            resolveSiteSpaceCustomHomePage(makeTargetedSiteSpace('custom'), pages)?.page.id
        ).toBe('custom');
    });

    it('falls back when the custom home page is unavailable', () => {
        expect(
            resolveSiteSpaceCustomHomePage(makeTargetedSiteSpace('missing'), pages)
        ).toBeUndefined();
    });

    it('falls back when the target is not a document', () => {
        const pagesWithGroup = [
            {
                id: 'group',
                type: 'group',
                path: 'group',
                pages: [pages[1]],
            },
        ] as unknown as RevisionPageDocument[];

        expect(
            resolveSiteSpaceCustomHomePage(makeTargetedSiteSpace('group'), pagesWithGroup)
        ).toBeUndefined();
    });

    it('adds the root path only to the custom home page', () => {
        const siteSpace = makeTargetedSiteSpace('custom');

        expect(getSiteSpacePagePaths(siteSpace, pages, pages[0]!)).toEqual(['introduction']);
        expect(getSiteSpacePagePaths(siteSpace, pages, pages[1]!)).toEqual([
            '',
            'guides/getting-started',
        ]);
    });

    it('keeps every page on its normal path', () => {
        const linker = getLinkerForSiteSpace(
            createLinker({
                host: 'docs.example.com',
                siteBasePath: '/',
                spaceBasePath: '/alias',
            }),
            makeTargetedSiteSpace('custom'),
            pages
        );

        expect(linker.toPathForPage({ pages, page: pages[0]! })).toBe('/alias/introduction');
        expect(linker.toPathForPage({ pages, page: pages[1]! })).toBe(
            '/alias/guides/getting-started'
        );
    });

    it('preserves whole-space root behavior when the target is unavailable', () => {
        const linker = getLinkerForSiteSpace(
            createLinker({
                host: 'docs.example.com',
                siteBasePath: '/',
                spaceBasePath: '/alias',
            }),
            makeTargetedSiteSpace('missing'),
            pages
        );

        expect(linker.toPathForPage({ pages, page: pages[0]! })).toBe('/alias');
        expect(getSiteSpacePagePaths(makeTargetedSiteSpace('missing'), pages, pages[0]!)).toEqual([
            '',
            'introduction',
        ]);
    });
});

describe('getFallbackSiteSpacePath', () => {
    function makeVariant(id: string, path: string, isDefault: boolean): SiteSpace {
        return { id, path, default: isDefault } as unknown as SiteSpace;
    }

    function makeSection(
        id: string,
        path: string,
        isDefault: boolean,
        siteSpaces: SiteSpace[]
    ): SiteSection {
        return { id, path, default: isDefault, object: 'site-section', siteSpaces } as SiteSection;
    }

    function makeContext(structure: SiteStructure): GitBookSiteContext {
        return { structure } as GitBookSiteContext;
    }

    const defaultVariant = makeVariant('sitesp_en', 'eng-landing-page', true);
    const translationVariant = makeVariant('sitesp_ua', 'landing-page', false);
    const otherVariant = makeVariant('sitesp_docs_ua', 'documentation', false);

    const context = makeContext({
        type: 'sections',
        structure: [
            makeSection('sitesc_home', 'main-ua', true, [defaultVariant, translationVariant]),
            makeSection('sitesc_docs', 'novaposhta-docs', false, [otherVariant]),
        ],
    });

    it('returns an empty path for the default variant of the default section', () => {
        expect(getFallbackSiteSpacePath(context, defaultVariant)).toBe('');
    });

    it('keeps the section path for a non-default variant of the default section', () => {
        expect(getFallbackSiteSpacePath(context, translationVariant)).toBe('main-ua/landing-page');
    });

    it('keeps the section path for a non-default section', () => {
        expect(getFallbackSiteSpacePath(context, otherVariant)).toBe(
            'novaposhta-docs/documentation'
        );
    });

    it('returns the variant path on a site without sections', () => {
        const withoutSections = makeContext({
            type: 'siteSpaces',
            structure: [defaultVariant, translationVariant],
        });
        expect(getFallbackSiteSpacePath(withoutSections, translationVariant)).toBe('landing-page');
    });
});
