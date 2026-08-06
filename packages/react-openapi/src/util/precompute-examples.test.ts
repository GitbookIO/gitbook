import { describe, expect, it } from 'bun:test';

import type { OpenAPIV3 } from '@gitbook/openapi-parser';
import { parseOpenAPI } from '@gitbook/openapi-parser';
import { generateMediaTypeExamples, generateSchemaExample } from '../generateSchemaExample';
import { resolveOpenAPIOperation } from '../resolveOpenAPIOperation';
import { resolveOpenAPISchemas } from '../schemas/resolveOpenAPISchemas';
import { getExampleFromSchema, getExamplesFromMediaTypeObject } from './example';

async function fetchFilesystem(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    const { filesystem } = await parseOpenAPI({ value: text, rootURL: url });
    return filesystem;
}

/** Replaces every cached example with a marker, so a value that isn't one was regenerated. */
function markCache(root: unknown) {
    let count = 0;
    const walk = (node: unknown) => {
        if (!node || typeof node !== 'object') {
            return;
        }
        const store = (node as Record<string, Record<string, unknown>>)[
            'x-gitbook-generated-examples'
        ];
        if (store) {
            for (const key of Object.keys(store)) {
                store[key] = { value: `__cached-${count++}__` };
            }
        }
        for (const value of Object.values(node)) {
            walk(value);
        }
    };
    walk(root);
}

function isCached(value: unknown) {
    return typeof value === 'string' && value.startsWith('__cached-');
}

const context = { translation: 'en' } as never;

type MediaTypeLike = OpenAPIV3.MediaTypeObject & {
    example?: unknown;
    examples?: unknown;
    schema?: Record<string, unknown>;
};
type ResponseLike = { content?: Record<string, MediaTypeLike> };

describe('#precomputeExamples', () => {
    it('should leave nothing for the browser to regenerate', async () => {
        const filesystem = await fetchFilesystem(
            'https://petstore3.swagger.io/api/v3/openapi.json'
        );
        const regenerated: string[] = [];
        const check = (label: string, value: unknown) => {
            if (!isCached(value)) {
                regenerated.push(label);
            }
        };

        const operations = [
            { method: 'put', path: '/pet' },
            { method: 'post', path: '/pet' },
            { method: 'get', path: '/pet/findByStatus' },
            { method: 'post', path: '/user' },
        ];

        for (const descriptor of operations) {
            const resolved = await resolveOpenAPIOperation(filesystem, descriptor);
            if (!resolved) {
                continue;
            }

            // The block is a client component, so its data reaches the renderer through JSON.
            const data = JSON.parse(JSON.stringify(resolved));
            markCache(data.operation);
            const { path } = descriptor;

            for (const parameter of data.operation.parameters ?? []) {
                if (parameter?.schema) {
                    check(
                        `${path} parameter:${parameter.name}`,
                        generateSchemaExample(parameter.schema, { mode: 'write' })
                    );
                }
            }

            for (const [mediaType, object] of Object.entries<MediaTypeLike>(
                data.operation.requestBody?.content ?? {}
            )) {
                if (object.example || object.examples) {
                    continue;
                }
                for (const example of generateMediaTypeExamples(object, { mode: 'write' })) {
                    check(`${path} requestBody:${mediaType}`, example.value);
                }
            }

            for (const [status, response] of Object.entries<ResponseLike>(
                data.operation.responses ?? {}
            )) {
                for (const [mediaType, object] of Object.entries<MediaTypeLike>(
                    response?.content ?? {}
                )) {
                    if (object.example || object.examples) {
                        continue;
                    }
                    for (const { example } of getExamplesFromMediaTypeObject({
                        mediaType,
                        mediaTypeObject: object,
                        context,
                    })) {
                        check(
                            `${path} response:${status}:${mediaType}`,
                            mediaType === 'application/xml'
                                ? Object.values(example.value as object)[0]
                                : example.value
                        );
                    }
                }
            }
        }

        const schemas = await resolveOpenAPISchemas(filesystem, {
            schemas: ['Pet', 'Order', 'User'],
        });
        if (schemas) {
            const data = JSON.parse(JSON.stringify(schemas));
            markCache(data);
            for (const { name, schema } of data.schemas) {
                if (!schema.example) {
                    check(`schemas:${name}`, getExampleFromSchema({ schema }).value);
                }
            }
        }

        expect(regenerated).toEqual([]);
    });
});
