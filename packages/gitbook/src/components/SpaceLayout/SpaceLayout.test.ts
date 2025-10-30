import { describe, expect, it } from 'bun:test';
import { languages } from '@/intl/translations';
import { type SiteSpace, TranslationLanguage } from '@gitbook/api';
import { categorizeVariants } from './categorizeVariants';

type FakeSiteSpace = {
    id: SiteSpace['id'];
    title: SiteSpace['title'];
    space: Pick<SiteSpace['space'], 'language'>;
};

function makeContext(current: FakeSiteSpace, all: FakeSiteSpace[]) {
    return {
        // Only the properties used by categorizeVariants are required for these tests
        siteSpace: current,
        siteSpaces: all,
    } as unknown as Parameters<typeof categorizeVariants>[0];
}

const englishA = {
    id: 'en-a',
    title: 'Docs EN A',
    space: { language: TranslationLanguage.En },
};
const englishB = {
    id: 'en-b',
    title: 'Docs EN B',
    space: { language: TranslationLanguage.En },
};
const frenchA = {
    id: 'fr-a',
    title: 'Docs FR A',
    space: { language: TranslationLanguage.Fr },
};
const frenchB = {
    id: 'fr-b',
    title: 'Docs FR B',
    space: { language: TranslationLanguage.Fr },
};
const undefinedLanguage = {
    id: 'undefined',
    title: 'Docs in Undefined Language',
    space: { language: undefined },
};
const unsupportedLanguage = {
    id: 'unsupported',
    title: 'Docs in Unsupported Language',
    space: { language: 'xx' as TranslationLanguage },
};

describe('categorizeVariants', () => {
    it('returns all spaces as generic and no translations for single-language sites', () => {
        const ctx = makeContext(englishA, [englishA, englishB]);

        const result = categorizeVariants(ctx);

        expect(result.generic.map((s) => s.id)).toEqual(['en-a', 'en-b']);
        expect(result.translations).toEqual([]);
    });

    it('returns all spaces as generic and no translations for sites with 1 language and an undefined language', () => {
        const ctx = makeContext(englishA, [englishA, englishB, undefinedLanguage]);

        const result = categorizeVariants(ctx);

        expect(result.generic.map((s) => s.id)).toEqual(['en-a', 'en-b', 'undefined']);
        expect(result.translations).toEqual([]);
    });

    it('keeps one-per-language translations without remapping titles', () => {
        const ctx = makeContext(englishA, [englishA, frenchA]);

        const result = categorizeVariants(ctx);

        // Generic should only include current language variants when multi-language
        expect(result.generic.map((s) => s.id)).toEqual(['en-a']);

        // With exactly 1 per language, translations length equals number of languages → no remap
        expect(result.translations.map((s) => ({ id: s.id, title: s.title }))).toEqual([
            { id: 'en-a', title: 'Docs EN A' },
            { id: 'fr-a', title: 'Docs FR A' },
        ]);
    });

    it('keeps one-per-language translations without remapping titles, including unsupported languages', () => {
        const ctx = makeContext(englishA, [englishA, unsupportedLanguage]);

        const result = categorizeVariants(ctx);

        // Generic should only include current language variants when multi-language
        expect(result.generic.map((s) => s.id)).toEqual(['en-a']);

        // With exactly 1 per language, translations length equals number of languages → no remap
        expect(result.translations.map((s) => ({ id: s.id, title: s.title }))).toEqual([
            { id: 'en-a', title: 'Docs EN A' },
            { id: 'unsupported', title: 'Docs in Unsupported Language' },
        ]);
    });

    it('keeps one-per-language translations when there are more than 1 language and an undefined language', () => {
        const ctx = makeContext(englishA, [englishA, frenchA, undefinedLanguage]);

        const result = categorizeVariants(ctx);

        expect(result.generic.map((s) => s.id)).toEqual(['en-a']);
        expect(result.translations.map((s) => ({ id: s.id, title: s.title }))).toEqual([
            { id: 'en-a', title: 'Docs EN A' },
            { id: 'fr-a', title: 'Docs FR A' },
            { id: 'undefined', title: 'Docs in Undefined Language' },
        ]);
    });

    it('deduplicates to first space per language and maps titles to language names', () => {
        const ctx = makeContext(englishA, [englishA, englishB, frenchA, frenchB]);

        const result = categorizeVariants(ctx);

        // Generic includes all current-language variants when multi-language
        expect(result.generic.map((s) => s.id)).toEqual(['en-a', 'en-b']);

        // Distinct languages are ['en','fr'] but initial translations had 4 → remap
        // After remap: first per language, with title set to language label
        expect(result.translations.map((s) => ({ id: s.id, title: s.title }))).toEqual([
            { id: 'en-a', title: languages.en.language },
            { id: 'fr-a', title: languages.fr.language },
        ]);
    });

    it('deduplicates to first space per language and maps titles to language names, and falls back to original title if no language is found', () => {
        const ctx = makeContext(englishA, [
            englishA,
            englishB,
            frenchA,
            frenchB,
            undefinedLanguage,
            unsupportedLanguage,
        ]);

        const result = categorizeVariants(ctx);

        expect(result.generic.map((s) => s.id)).toEqual(['en-a', 'en-b']);
        expect(result.translations.map((s) => ({ id: s.id, title: s.title }))).toEqual([
            { id: 'en-a', title: languages.en.language },
            { id: 'fr-a', title: languages.fr.language },
            { id: 'undefined', title: 'Docs in Undefined Language' },
            { id: 'unsupported', title: 'Docs in Unsupported Language' },
        ]);
    });
});
