import { beforeEach, describe, expect, it } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { DocumentBlockCode } from '@gitbook/api';

import type { HighlightTheme } from './highlight-tokens';
import { type ShikiAssetLoader, createHighlight } from './highlighter';
import { getShikiGrammarAssetPath } from './shiki-catalog';

const staticDir = join(import.meta.dir, '../../../../public/~gitbook/static');

let calls: Map<string, number>;

const readAsset: ShikiAssetLoader = async (path) =>
    JSON.parse(await readFile(join(staticDir, path), 'utf8'));

const countingLoader: ShikiAssetLoader = async (path) => {
    calls.set(path, (calls.get(path) ?? 0) + 1);
    return readAsset(path);
};

beforeEach(() => {
    calls = new Map();
});

function codeBlock(syntax: string, code: string): DocumentBlockCode {
    return {
        object: 'block',
        type: 'code',
        data: { syntax },
        nodes: code.split('\n').map((text) => ({
            object: 'block',
            type: 'code-line',
            data: {},
            nodes: [{ object: 'text', leaves: [{ object: 'leaf', marks: [], text }] }],
        })),
    } as DocumentBlockCode;
}

const jsBlock = codeBlock('javascript', 'const answer = 42;');

function isHighlighted(result: HighlightTheme) {
    return result.lines.some((line) => line.tokens.some((token) => token.type === 'shiki'));
}

function colorOf(result: HighlightTheme, content: string) {
    for (const line of result.lines) {
        for (const token of line.tokens) {
            if (token.type === 'shiki' && token.token.content.trim() === content) {
                // light-dark() output puts the colour in htmlStyle rather than color.
                const style = token.token.htmlStyle;
                return typeof style === 'object' ? style.color : undefined;
            }
        }
    }
    return undefined;
}

describe('createHighlight', () => {
    it('loads each grammar once under concurrency', async () => {
        const { highlight } = createHighlight(countingLoader);
        const results = await Promise.all(Array.from({ length: 10 }, () => highlight(jsBlock, [])));
        expect(results.every(isHighlighted)).toBe(true);
        expect(calls.get(getShikiGrammarAssetPath('javascript'))).toBe(1);
    });

    it('falls back to plain highlighting and retries after a failure', async () => {
        let failed = false;
        const failOnceLoader: ShikiAssetLoader = async (path) => {
            if (!failed && path === getShikiGrammarAssetPath('javascript')) {
                failed = true;
                throw new Error('asset unavailable');
            }
            return readAsset(path);
        };
        const { highlight } = createHighlight(failOnceLoader);

        const first = await highlight(jsBlock, []);
        expect(isHighlighted(first)).toBe(false);
        expect(first.lines[0]?.tokens.map((token) => token.type)).toEqual(['plain']);

        const second = await highlight(jsBlock, []);
        expect(isHighlighted(second)).toBe(true);
    });

    it('highlights embedded languages', async () => {
        const { highlight } = createHighlight(countingLoader);
        const result = await highlight(
            codeBlock('vue', '<template><p>hi</p></template>\n<script>\nconst msg = 1;\n</script>'),
            []
        );
        const keywordColor = colorOf(result, 'const');
        expect(keywordColor).toBeDefined();
        expect(keywordColor).not.toBe(colorOf(result, 'msg'));
    });

    it('loads custom themes from code, not from assets', async () => {
        const { highlight } = createHighlight(countingLoader);
        const result = await highlight(jsBlock, [], {
            themes: { light: 'default-light', dark: 'github-dark' } as never,
        });
        expect(isHighlighted(result)).toBe(true);
        expect([...calls.keys()].some((path) => path.includes('default-light'))).toBe(false);
        expect([...calls.keys()].some((path) => path.endsWith('themes/github-dark.json'))).toBe(
            true
        );
    });
});
