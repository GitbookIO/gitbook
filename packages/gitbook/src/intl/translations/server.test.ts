import { afterEach, describe, expect, it, mock } from 'bun:test';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { type TranslationLanguage, defaultLanguage, languageLocales } from '.';
import { getSpaceLanguage } from '../server';
import { loadLanguage } from './server';

const originalFetch = globalThis.fetch;

afterEach(() => {
    globalThis.fetch = originalFetch;
});

describe('translation assets', () => {
    it('contains a generated asset for every supported locale', async () => {
        const files = await readdir(
            join(import.meta.dir, '../../../public/~gitbook/static/translations')
        );

        expect(files.sort()).toEqual(languageLocales.map((locale) => `${locale}.json`).sort());

        const expectedKeys = Object.keys(defaultLanguage).sort();
        await Promise.all(
            files.map(async (file) => {
                const translation = JSON.parse(
                    await readFile(
                        join(import.meta.dir, '../../../public/~gitbook/static/translations', file),
                        'utf8'
                    )
                ) as Record<string, unknown>;

                expect(Object.keys(translation).sort()).toEqual(expectedKeys);
                expect(Object.values(translation).every((value) => typeof value === 'string')).toBe(
                    true
                );
            })
        );
    });

    it('serves generated assets with immutable cache headers', async () => {
        const headers = await readFile(join(import.meta.dir, '../../../public/_headers'), 'utf8');

        expect(headers).toContain('/~gitbook/static/*');
        expect(headers).toContain('cache-control: public,max-age=31536000,immutable');
    });

    it('shares a locale request within an isolate', async () => {
        const translation = { ...defaultLanguage, locale: 'fr', language: 'Français', flag: '🇫🇷' };
        globalThis.fetch = mock(() => Promise.resolve(Response.json(translation)));

        const [first, second] = await Promise.all([loadLanguage('fr'), loadLanguage('fr')]);

        expect(first).toEqual(translation);
        expect(second).toEqual(translation);
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('falls back to English when a locale asset cannot be loaded', async () => {
        globalThis.fetch = mock(() => Promise.resolve(new Response(null, { status: 404 })));

        const language = await getSpaceLanguage({ locale: 'de' } as never);

        expect(language).toEqual(defaultLanguage);
    });

    it('rejects locale assets with an incomplete translation shape', async () => {
        globalThis.fetch = mock(() =>
            Promise.resolve(Response.json({ locale: 'es' } satisfies Partial<TranslationLanguage>))
        );

        expect(await loadLanguage('es')).toBeNull();
    });
});
