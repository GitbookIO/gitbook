import { describe, it } from 'bun:test';
import { parseOpenAPI } from './parse';

const spec = await Bun.file(new URL('./fixtures/recursive-spec.json', import.meta.url)).text();

describe('#parseOpenAPI', () => {
    it('parses an OpenAPI document', async () => {
        const schema = await parseOpenAPI({
            value: spec,
            rootURL: null,
        });
        // Ensure the structure returned is not recursive (not dereferenced).
        JSON.stringify(schema);
    });
});
