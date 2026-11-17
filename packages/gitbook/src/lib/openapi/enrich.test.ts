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
});
