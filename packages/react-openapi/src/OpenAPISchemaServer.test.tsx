import { describe, expect, it } from 'bun:test';
import { renderToReadableStream } from 'react-dom/server';

import { parseOpenAPI } from '@gitbook/openapi-parser';

import type { OpenAPIClientContext } from './context';
import { OpenAPIRootSchema } from './OpenAPISchemaServer';
import { resolveOpenAPISchemas } from './schemas/resolveOpenAPISchemas';
import { translations } from './translations';

const context: OpenAPIClientContext = {
    translation: translations.en,
    icons: {
        chevronDown: null,
        chevronRight: null,
        plus: null,
        copy: null,
        check: null,
        lock: null,
        mcp: null,
        hashtag: null,
    },
    expandAllModelSections: true,
    scalarRuntimeURL: '',
    $$isClientContext$$: true,
};

describe('OpenAPIRootSchema', () => {
    it('should stop at a self-reference behind a nullable union when expanded', async () => {
        const { filesystem } = await parseOpenAPI({
            value: JSON.stringify({
                openapi: '3.1.0',
                info: { title: 'Test', version: '1.0.0' },
                paths: {},
                components: {
                    schemas: {
                        FilterClause: {
                            type: 'object',
                            properties: {
                                AND: {
                                    anyOf: [
                                        {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/FilterClause' },
                                        },
                                        { type: 'null' },
                                    ],
                                },
                            },
                        },
                    },
                },
            }),
            rootURL: 'memory://spec.json',
        });
        const resolved = await resolveOpenAPISchemas(filesystem, { schemas: ['FilterClause'] });
        const schema = resolved?.schemas[0]?.schema;
        if (!schema) {
            throw new Error('FilterClause not resolved');
        }

        const stream = await renderToReadableStream(
            <OpenAPIRootSchema schema={schema} context={context} />
        );
        const html = await new Response(stream).text();

        expect(html).toContain('AND');
    });
});
