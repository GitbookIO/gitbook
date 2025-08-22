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
            '<p>Social platform</p>'
        );
    });
});
