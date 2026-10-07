import { describe, expect, it } from 'bun:test';

import type {
    RevisionPageDocument,
    SiteExternalLink,
    SiteSection,
    SiteSectionGroup,
    SiteSpace,
    SiteStructure,
} from '@gitbook/api';
import { TranslationLanguage } from '@gitbook/api';

import { createLinker } from './links';
import {
    filterSiteSpacesByLocale,
    findSiteSpaceBy,
    getFallbackSiteSpacePath,
    getLinkerForSiteSpace,
    getSiteStructureSections,
    getSiteSpacePagePaths,
    listAllSiteSpaces,
    resolveSiteSpaceCustomHomePage,
} from './sites';
import type { GitBookSiteContext } from '@/lib/context';

function makeSiteSpace(language: TranslationLanguage | undefined): SiteSpace {
    return { space: { language } } as SiteSpace;
}

function makeExternalLink(id: string): SiteExternalLink {
    return {
        object: 'site-external-link',
        id,
        title: 'GitBook',
        localizedTitle: { fr: 'GitBook FR' } as SiteExternalLink['localizedTitle'],
        description: 'Visit GitBook',
        localizedDescription: {
            fr: 'Visiter GitBook',
        } as SiteExternalLink['localizedDescription'],
        draft: false,
        url: 'https://www.gitbook.com',
        icon: 'link',
    };
}

describe('site structure traversal', () => {
    const rootSpace = { id: 'root-space' } as SiteSpace;
    const nestedSpace = { id: 'nested-space' } as SiteSpace;
    const rootSection = {
        object: 'site-section',
        id: 'root-section',
        siteSpaces: [rootSpace],
    } as SiteSection;
    const nestedSection = {
        object: 'site-section',
        id: 'nested-section',
        siteSpaces: [nestedSpace],
    } as SiteSection;
    const nestedLink = makeExternalLink('nested-link');
    const group = {
        object: 'site-section-group',
        id: 'group',
        children: [nestedLink, nestedSection],
    } as SiteSectionGroup;
    const rootLink = makeExternalLink('root-link');
    const structure = {
        type: 'sections',
        structure: [rootSection, rootLink, group],
    } satisfies SiteStructure;

    it('preserves external links in navigation order', () => {
        expect(getSiteStructureSections(structure)).toEqual([rootSection, rootLink, group]);
        expect(group.children).toEqual([nestedLink, nestedSection]);
    });

    it('excludes external links from section and space results', () => {
        expect(getSiteStructureSections(structure, { ignoreGroups: true })).toEqual([
            rootSection,
            nestedSection,
        ]);
        expect(listAllSiteSpaces(structure)).toEqual([rootSpace, nestedSpace]);
    });

    it('returns every section group from the root to the immediate parent', () => {
        const targetSpace = { id: 'target-space' } as SiteSpace;
        const targetSection = {
            object: 'site-section',
            id: 'target-section',
            siteSpaces: [targetSpace],
        } as SiteSection;
        const childGroup = {
            object: 'site-section-group',
            id: 'child-group',
            children: [targetSection],
        } as SiteSectionGroup;
        const firstChildGroup = {
            object: 'site-section-group',
            id: 'first-child-group',
            children: [childGroup],
        } as SiteSectionGroup;
        const rootGroup = {
            object: 'site-section-group',
            id: 'root-group',
            children: [firstChildGroup],
        } as SiteSectionGroup;

        const found = findSiteSpaceBy(
            { type: 'sections', structure: [rootGroup] },
            (siteSpace) => siteSpace.id === targetSpace.id
        );

        expect(found?.siteSectionGroup).toBe(childGroup);
        expect(found?.siteSectionGroups).toEqual([rootGroup, firstChildGroup, childGroup]);
    });
});

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
    ] as RevisionPageDocument[];

    function makeTargetedSiteSpace(pageId: string): SiteSpace {
        return { pageId } as SiteSpace;
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
        ] as RevisionPageDocument[];

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
        return { id, path, default: isDefault } as SiteSpace;
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
