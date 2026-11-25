import { describe, expect, it } from 'bun:test';
import { join } from 'node:path';

import { getLanguageForSyntax } from './highlight';
import {
    SHIKI_LANGUAGES,
    SHIKI_LANGUAGE_GRAMMARS,
    SHIKI_THEMES,
    getShikiGrammarAssetPath,
    getShikiThemeAssetPath,
} from './shiki-catalog';

const staticDir = join(import.meta.dir, '../../../../public/~gitbook/static');

describe('shiki catalog', () => {
    it('maps ids and aliases to canonical ids', () => {
        expect(SHIKI_LANGUAGES.javascript).toBe('javascript');
        expect(SHIKI_LANGUAGES.js).toBe('javascript');
        expect(SHIKI_LANGUAGES['objective-c']).toBe('objective-c');
    });

    it('lists embedded grammars before the language grammar', () => {
        const vue = SHIKI_LANGUAGE_GRAMMARS.vue ?? [];
        expect(vue.at(-1)).toBe('vue');
        expect(vue).toEqual(expect.arrayContaining(['html', 'css', 'javascript']));
    });

    it('writes one JSON file per grammar, including internal ones', async () => {
        const grammar = await Bun.file(
            join(staticDir, getShikiGrammarAssetPath('cpp-macro'))
        ).json();
        expect(grammar.name).toBe('cpp-macro');
        expect(grammar.scopeName).toBeString();
    });

    it('writes every bundled theme', async () => {
        expect(SHIKI_THEMES['github-dark']?.type).toBe('dark');
        expect(
            await Bun.file(join(staticDir, getShikiThemeAssetPath('github-dark'))).exists()
        ).toBe(true);
    });
});

describe('getLanguageForSyntax', () => {
    it('resolves GitBook syntaxes to canonical ids', () => {
        expect(getLanguageForSyntax('JSON')).toBe('json');
        expect(getLanguageForSyntax('js')).toBe('javascript');
        expect(getLanguageForSyntax('objectivec')).toBe('objective-c');
        expect(getLanguageForSyntax('parser')).toBe('blade');
        expect(getLanguageForSyntax('not-a-language')).toBeNull();
    });
});
