import { afterAll, describe, expect, it } from 'bun:test';
import { join } from 'node:path';

import { getClientHighlight } from './highlight-client';
import { getShikiGrammarAssetPath } from './shiki-catalog';

const staticDir = join(import.meta.dir, '../../../../public/~gitbook/static');
const requested: string[] = [];

// Stands in for the CDN serving `~gitbook/static`.
const server = Bun.serve({
    port: 0,
    fetch(request) {
        const { pathname } = new URL(request.url);
        requested.push(pathname);
        const prefix = '/~gitbook/static/';
        if (!pathname.startsWith(prefix)) {
            return new Response('not found', { status: 404 });
        }
        const file = Bun.file(join(staticDir, pathname.slice(prefix.length)));
        return new Response(file);
    },
});

afterAll(() => server.stop(true));

const jsBlock = {
    object: 'block',
    type: 'code',
    data: { syntax: 'javascript' },
    nodes: [
        {
            object: 'block',
            type: 'code-line',
            data: {},
            nodes: [
                { object: 'text', leaves: [{ object: 'leaf', marks: [], text: 'const a = 1;' }] },
            ],
        },
    ],
} as never;

describe('getClientHighlight', () => {
    it('fetches assets relative to the given static assets URL', async () => {
        const { highlight } = getClientHighlight(`${server.url}~gitbook/static/`);
        const result = await highlight(jsBlock, []);
        expect(result.lines[0]?.tokens.some((token) => token.type === 'shiki')).toBe(true);
        expect(requested).toContain(`/~gitbook/static/${getShikiGrammarAssetPath('javascript')}`);
    });

    it('reuses one highlighter per assets URL', () => {
        const url = `${server.url}~gitbook/static/`;
        expect(getClientHighlight(url)).toBe(getClientHighlight(url));
    });

    it('falls back to plain when the assets host answers an error', async () => {
        const { highlight } = getClientHighlight(`${server.url}missing/`);
        const result = await highlight(jsBlock, []);
        expect(result.lines[0]?.tokens.map((token) => token.type)).toEqual(['plain']);
    });
});
