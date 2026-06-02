import { describe, expect, it } from 'bun:test';
import type { SiteSpace } from '@gitbook/api';
import { TranslationLanguage } from '@gitbook/api';

import { filterSiteSpacesByLocale } from './sites';

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
