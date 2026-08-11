import { describe, expect, it } from 'bun:test';
import type { SiteSection, SiteSpace, SiteStructure } from '@gitbook/api';
import { TranslationLanguage } from '@gitbook/api';

import type { GitBookSiteContext } from '@/lib/context';
import { filterSiteSpacesByLocale, getFallbackSiteSpacePath } from './sites';

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
    } as SiteStructure);

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
        } as SiteStructure);
        expect(getFallbackSiteSpacePath(withoutSections, translationVariant)).toBe('landing-page');
    });
});
