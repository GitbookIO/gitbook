import { describe, expect, it, mock } from 'bun:test';

mock.module('server-only', () => ({}));

const { getShikiAssets, preloadShikiAssets } = await import('./shiki-assets');

describe('getShikiAssets', () => {
    it('resolves a syntax alias to its canonical language module', () => {
        const assets = getShikiAssets('js');

        expect(assets?.runtimeURL).toEndWith('/~gitbook/static/shiki/shiki@3.21.0.mjs');
        expect(assets?.languageAliasesURL).toEndWith('/~gitbook/static/shiki/languages.mjs');
        expect(assets?.languageURL).toEndWith('/~gitbook/static/shiki/langs/javascript.mjs');
    });

    it('resolves GitBook syntax aliases', () => {
        expect(getShikiAssets('parser')?.languageURL).toEndWith('/langs/blade.mjs');
        expect(getShikiAssets('objectivec')?.languageURL).toEndWith('/langs/objective-c.mjs');
    });

    it('preloads the runtime and manifest for an unknown but usable syntax', () => {
        const assets = getShikiAssets('not-a-shiki-language');

        expect(assets?.runtimeURL).toEndWith('/~gitbook/static/shiki/shiki@3.21.0.mjs');
        expect(assets?.languageAliasesURL).toEndWith('/~gitbook/static/shiki/languages.mjs');
        expect(assets?.languageURL).toBeUndefined();
    });

    it('does not resolve assets for syntaxless, invalid, or Mermaid code blocks', () => {
        expect(getShikiAssets(undefined)).toBeNull();
        expect(getShikiAssets('application/json')).toBeNull();
        expect(getShikiAssets('mermaid')).toBeNull();
    });

    it('preloads the files the browser highlighter will import', () => {
        const preloads: string[] = [];

        preloadShikiAssets('js', (href) => preloads.push(href));

        expect(preloads).toEqual([
            expect.stringContaining('/~gitbook/static/shiki/shiki@3.21.0.mjs'),
            expect.stringContaining('/~gitbook/static/shiki/languages.mjs'),
            expect.stringContaining('/~gitbook/static/shiki/langs/javascript.mjs'),
        ]);
    });

    it('does not preload Shiki for a Mermaid code block', () => {
        const preloads: string[] = [];

        preloadShikiAssets('mermaid', (href) => preloads.push(href));

        expect(preloads).toEqual([]);
    });
});
