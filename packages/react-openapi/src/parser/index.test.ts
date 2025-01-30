import { expect, it } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { parseOpenAPI } from '.';

it('should parse and not give a recursive structure', async () => {
    const schema = await parseOpenAPI({
        value: await readFile(new URL('./fixtures/spec-example.json', import.meta.url), 'utf-8'),
        url: 'https://example.com',
        parseMarkdown: async (input) => input,
    });

    JSON.stringify(schema);
    expect(schema.openapi).toBe('3.0.0');
});
