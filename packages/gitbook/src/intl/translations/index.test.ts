import { describe, expect, it } from 'bun:test';

import { es } from './es';
import { fr } from './fr';
import { isAvailableLanguage, languages, loadLanguage } from './index';

describe('regional language variants', () => {
    it.each([
        ['fr-ca', fr],
        ['es-mx', es],
        ['es-419', es],
    ] as const)('loads %s with its own metadata and the base strings', async (locale, base) => {
        expect(isAvailableLanguage(locale)).toBe(true);

        const language = await loadLanguage(locale);

        expect(language).toEqual({ ...base, ...languages[locale] });
        expect(language.locale).toBe(locale);
    });
});
