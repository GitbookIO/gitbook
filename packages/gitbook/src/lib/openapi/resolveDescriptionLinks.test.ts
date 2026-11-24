import { describe, expect, it } from 'bun:test';

import { parseOpenAPI } from '@gitbook/openapi-parser';

import { resolveOpenAPIDescriptionLinks } from './resolveDescriptionLinks';

const APP_URL = 'https://app.gitbook.com/s/space-1/tables';

describe('resolveOpenAPIDescriptionLinks', () => {
    it('points tagged links at their resolved URL without mutating the input', async () => {
        const original =
            `<p><a href="${APP_URL}" data-gitbook-ref="/spaces/space-1/pages/page-1">Fields</a>` +
            ` <a href="${APP_URL}" data-gitbook-ref="/spaces/space-1/pages/missing">Gone</a>` +
            ' <a href="https://example.com">Docs</a></p>';
        const { filesystem } = await parseOpenAPI({
            value: JSON.stringify({
                openapi: '3.0.0',
                info: { title: 'Test', version: '1.0.0' },
                paths: {},
                components: {
                    schemas: {
                        Condition: { type: 'object', 'x-gitbook-description-html': original },
                    },
                },
            }),
            rootURL: null,
        });

        const resolved = await resolveOpenAPIDescriptionLinks(filesystem, async (ref) =>
            ref.kind === 'page' && ref.page === 'page-1' ? { href: '/docs/tables' } : null
        );

        expect(resolved[0]?.specification.components?.schemas?.Condition).toMatchObject({
            'x-gitbook-description-html':
                '<p><a href="/docs/tables" data-gitbook-ref="/spaces/space-1/pages/page-1">Fields</a>' +
                ` <a href="${APP_URL}" data-gitbook-ref="/spaces/space-1/pages/missing">Gone</a>` +
                ' <a href="https://example.com">Docs</a></p>',
        });
        // The spec content comes from the data cache, shared across sites.
        expect(filesystem[0]?.specification.components?.schemas?.Condition).toMatchObject({
            'x-gitbook-description-html': original,
        });
    });
});
