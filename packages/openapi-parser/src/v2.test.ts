import { describe, expect, it } from 'bun:test';
import { convertOpenAPIV2ToOpenAPIV3 } from './v2';

const specV2 = await Bun.file(new URL('./fixtures/spec-v2.json', import.meta.url)).text();

describe('#convertOpenAPIV2ToOpenAPIV3', () => {
    it('converts an OpenAPIV2 in V3', async () => {
        const schema = await convertOpenAPIV2ToOpenAPIV3({
            value: specV2,
            rootURL: null,
        });
        // Ensure the structure returned is not recursive (not dereferenced).
        JSON.stringify(schema);
        expect(schema[0]?.specification.openapi).toBe('3.1.1');
    });
});
