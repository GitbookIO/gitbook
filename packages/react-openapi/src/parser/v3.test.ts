import { it } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { parseOpenAPIV3 } from './v3';

it('should parse and not give a recursive structure', async () => {
    await parseOpenAPIV3({
        value: await readFile(new URL('./fixtures/spec-example.json', import.meta.url), 'utf-8'),
        url: 'https://example.com',
        parseMarkdown: async (input) => input,
    });
});
