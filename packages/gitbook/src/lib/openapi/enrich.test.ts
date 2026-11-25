import { describe, expect, it } from 'bun:test';

import { parseOpenAPI } from '@gitbook/openapi-parser';

import { enrichFilesystem } from './enrich';

const spec = await Bun.file(new URL('./fixtures/multiline-spec.yaml', import.meta.url)).text();

describe('#enrichFilesystem', () => {
    it('supports multiline descriptions', async () => {
        const { filesystem } = await parseOpenAPI({
            value: spec,
            rootURL: null,
        });
        const enriched = await enrichFilesystem(filesystem);
        expect(enriched[0]?.specification.paths['/pet'].put['x-gitbook-description-html']).toBe(
            '<p>Social platform<br>Hello</p>'
        );
    });

    it('parses descriptions that collide with Object.prototype keys', async () => {
        const { filesystem } = await parseOpenAPI({
            value: JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Test', version: '1.0.0' },
                paths: {
                    '/a': { get: { description: 'constructor', responses: {} } },
                    '/b': { get: { description: 'constructor', responses: {} } },
                },
            }),
            rootURL: null,
        });
        const enriched = await enrichFilesystem(filesystem);
        const paths = enriched[0]?.specification.paths;
        expect(paths['/a'].get['x-gitbook-description-html']).toBe('<p>constructor</p>');
        expect(paths['/b'].get['x-gitbook-description-html']).toBe('<p>constructor</p>');
    });

    async function enrichSchemas(schemas: Record<string, unknown>) {
        const { filesystem } = await parseOpenAPI({
            value: JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Test', version: '1.0.0' },
                paths: {},
                components: { schemas },
            }),
            rootURL: null,
        });
        const enriched = await enrichFilesystem(filesystem);
        return enriched[0]?.specification.components.schemas;
    }

    it('drops description fields supplied by the specification', async () => {
        const schemas = await enrichSchemas({
            Pet: {
                type: 'object',
                'x-gitbook-description-html': '<b>spec</b>',
                'x-gitbook-description-document': { nodes: [] },
            },
        });
        expect(schemas.Pet['x-gitbook-description-html']).toBeUndefined();
        expect(schemas.Pet['x-gitbook-description-document']).toBeUndefined();
    });

    it('sanitizes descriptions of schemas named example', async () => {
        const schemas = await enrichSchemas({
            example: { type: 'string', description: '<img src=x onerror=alert(1)>' },
        });
        const html = schemas.example['x-gitbook-description-html'];
        expect(html).toContain('<img');
        expect(html).not.toContain('onerror');
    });

    it('sanitizes descriptions in example values that could render HTML', async () => {
        const schemas = await enrichSchemas({
            Pet: {
                type: 'object',
                example: {
                    description: '<img src=x onerror=alert(1)>',
                    'x-gitbook-description-html': '<img src=x onerror=alert(2)>',
                },
            },
        });
        const html = schemas.Pet.example['x-gitbook-description-html'];
        expect(html).toBeDefined();
        expect(html).not.toContain('onerror');
    });

    it('keeps example values without HTML as written', async () => {
        const schemas = await enrichSchemas({
            Pet: { type: 'object', example: { description: 'A **good** dog' } },
        });
        expect(schemas.Pet.example).toEqual({ description: 'A **good** dog' });
    });
});
