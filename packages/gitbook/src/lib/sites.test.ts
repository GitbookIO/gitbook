import { describe, expect, it } from 'bun:test';
import type { SiteSpace, SiteStructure } from '@gitbook/api';
import { TranslationLanguage } from '@gitbook/api';

import { createLinker } from './links';
import { filterSiteSpacesByLocale, toEmbeddableLinkForURL } from './sites';

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

describe('toEmbeddableLinkForURL', () => {
    function siteSpaceWithURL(published: string): SiteSpace {
        return { urls: { published } } as unknown as SiteSpace;
    }

    // Multi-space site served at the host root: a default space and a `help-center` section.
    const structure = {
        type: 'siteSpaces',
        structure: [
            siteSpaceWithURL('https://help.example.com'),
            siteSpaceWithURL('https://help.example.com/help-center'),
        ],
    } as unknown as SiteStructure;

    const linker = createLinker({
        host: 'help.example.com',
        spaceBasePath: '/',
        siteBasePath: '/',
    });

    it('places the section base before the embed path for a cross-space URL', () => {
        expect(
            toEmbeddableLinkForURL(
                linker,
                structure,
                'https://help.example.com/help-center/integrations'
            )
        ).toBe('/help-center/~gitbook/embed/page/integrations');
    });

    it('resolves a page in the default space', () => {
        expect(
            toEmbeddableLinkForURL(
                linker,
                structure,
                'https://help.example.com/getting-started/quickstart'
            )
        ).toBe('/~gitbook/embed/page/getting-started/quickstart');
    });

    it('resolves the section root', () => {
        expect(
            toEmbeddableLinkForURL(linker, structure, 'https://help.example.com/help-center')
        ).toBe('/help-center/~gitbook/embed/page');
    });

    it('returns null when the URL maps to no space', () => {
        const subdirStructure = {
            type: 'siteSpaces',
            structure: [
                siteSpaceWithURL('https://help.example.com/docs'),
                siteSpaceWithURL('https://help.example.com/help-center'),
            ],
        } as unknown as SiteStructure;

        expect(
            toEmbeddableLinkForURL(linker, subdirStructure, 'https://help.example.com/marketing/x')
        ).toBeNull();
    });
});
