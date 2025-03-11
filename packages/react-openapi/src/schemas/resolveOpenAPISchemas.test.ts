import { describe, expect, it } from 'bun:test';

import { parseOpenAPI, traverse } from '@gitbook/openapi-parser';
import { resolveOpenAPISchemas } from './resolveOpenAPISchemas';

async function fetchFilesystem(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    const filesystem = await parseOpenAPI({ value: text, rootURL: url });
    const transformedFs = await traverse(filesystem, async (node) => {
        if ('description' in node && typeof node.description === 'string' && node.description) {
            node['x-gitbook-description-html'] = node.description;
        }
        return node;
    });
    return transformedFs;
}

describe('#resolveOpenAPISchemas', () => {
    it('should resolve refs', async () => {
        const filesystem = await fetchFilesystem(
            'https://petstore3.swagger.io/api/v3/openapi.json'
        );
        const resolved = await resolveOpenAPISchemas(filesystem, { schemas: ['Pet', 'Tag'] });

        expect(resolved).toMatchObject({
            schemas: [
                {
                    name: 'Pet',
                    schema: {
                        properties: {
                            tags: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: {
                                            format: 'int64',
                                            type: 'integer',
                                        },
                                        name: {
                                            type: 'string',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    name: 'Tag',
                    schema: {
                        type: 'object',
                        properties: {
                            id: {
                                type: 'integer',
                                format: 'int64',
                            },
                            name: {
                                type: 'string',
                            },
                        },
                        xml: {
                            name: 'tag',
                        },
                    },
                },
            ],
        });
    });

    it('should support yaml', async () => {
        const filesystem = await fetchFilesystem(
            'https://petstore3.swagger.io/api/v3/openapi.yaml'
        );
        const resolved = await resolveOpenAPISchemas(filesystem, { schemas: ['Pet'] });

        expect(resolved).toMatchObject({
            schemas: [
                {
                    name: 'Pet',
                    schema: {
                        properties: {
                            tags: {
                                type: 'array',
                                items: {
                                    properties: {
                                        id: {
                                            format: 'int64',
                                            type: 'integer',
                                        },
                                        name: {
                                            type: 'string',
                                        },
                                    },
                                    type: 'object',
                                },
                            },
                        },
                    },
                },
            ],
        });
    });

    it('should resolve circular refs', async () => {
        const filesystem = await fetchFilesystem('https://api.gitbook.com/openapi.json');
        const resolved = await resolveOpenAPISchemas(filesystem, {
            schemas: ['DocumentBlockTabs'],
        });

        expect(resolved).toMatchObject({
            schemas: [
                {
                    name: 'DocumentBlockTabs',
                    schema: {
                        type: 'object',
                        properties: {
                            object: {
                                type: 'string',
                                enum: ['block'],
                            },
                        },
                    },
                },
            ],
        });
    });

    it('should resolve to null if the schema does not exist', async () => {
        const filesystem = await fetchFilesystem(
            'https://petstore3.swagger.io/api/v3/openapi.json'
        );
        const resolved = await resolveOpenAPISchemas(filesystem, {
            schemas: ['NonExistentSchema'],
        });

        expect(resolved).toBe(null);
    });

    it('should parse Swagger 2.0', async () => {
        const filesystem = await fetchFilesystem('https://petstore.swagger.io/v2/swagger.json');
        const resolved = await resolveOpenAPISchemas(filesystem, {
            schemas: ['Pet'],
        });

        expect(resolved).toMatchObject({
            schemas: [
                {
                    name: 'Pet',
                    schema: {
                        properties: {
                            tags: {
                                type: 'array',
                                items: {
                                    properties: {
                                        id: {
                                            format: 'int64',
                                            type: 'integer',
                                        },
                                        name: {
                                            type: 'string',
                                        },
                                    },
                                    type: 'object',
                                },
                            },
                        },
                    },
                },
            ],
        });
    });
});
