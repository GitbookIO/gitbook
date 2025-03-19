import { describe, expect, it } from 'bun:test';

import { parseOpenAPI, traverse } from '@gitbook/openapi-parser';
import { resolveOpenAPIOperation } from './resolveOpenAPIOperation';

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

describe('#resolveOpenAPIOperation', () => {
    it('should resolve refs', async () => {
        const filesystem = await fetchFilesystem(
            'https://petstore3.swagger.io/api/v3/openapi.json'
        );
        const resolved = await resolveOpenAPIOperation(filesystem, { method: 'put', path: '/pet' });

        expect(resolved).toMatchObject({
            servers: [
                {
                    url: '/api/v3',
                },
            ],
            operation: {
                tags: ['pet'],
                summary: 'Update an existing pet.',
                description: 'Update an existing pet by Id.',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'photoUrls'],
                            },
                        },
                    },
                },
            },
        });
    });

    it('should support yaml', async () => {
        const filesystem = await fetchFilesystem(
            'https://petstore3.swagger.io/api/v3/openapi.yaml'
        );
        const resolved = await resolveOpenAPIOperation(filesystem, { method: 'put', path: '/pet' });

        expect(resolved).toMatchObject({
            servers: [
                {
                    url: '/api/v3',
                },
            ],
            operation: {
                tags: ['pet'],
                summary: 'Update an existing pet.',
                description: 'Update an existing pet by Id.',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'photoUrls'],
                            },
                        },
                    },
                },
            },
        });
    });

    it('should resolve circular refs', async () => {
        const filesystem = await fetchFilesystem('https://api.gitbook.com/openapi.json');
        const resolved = await resolveOpenAPIOperation(filesystem, {
            method: 'get',
            path: '/spaces/{spaceId}/content/page/{pageId}',
        });

        expect(resolved).toMatchObject({
            servers: [
                {
                    url: '{host}/v1',
                },
            ],
            operation: {
                operationId: 'getPageById',
            },
        });
    });

    it('should resolve to null if the method is not supported', async () => {
        const filesystem = await fetchFilesystem(
            'https://petstore3.swagger.io/api/v3/openapi.json'
        );
        const resolved = await resolveOpenAPIOperation(filesystem, {
            method: 'dontexist',
            path: '/pet',
        });

        expect(resolved).toBe(null);
    });

    it('should parse Swagger 2.0', async () => {
        const filesystem = await fetchFilesystem('https://petstore.swagger.io/v2/swagger.json');
        const resolved = await resolveOpenAPIOperation(filesystem, {
            method: 'put',
            path: '/pet',
        });

        expect(resolved).toMatchObject({
            servers: [
                {
                    url: 'https://petstore.swagger.io/v2',
                },
                {
                    url: 'http://petstore.swagger.io/v2',
                },
            ],
            operation: {
                tags: ['pet'],
                summary: 'Update an existing pet',
                description: '',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'photoUrls'],
                            },
                        },
                    },
                },
            },
        });
    });

    it('should resolve a ref with whitespace', async () => {
        const filesystem = await fetchFilesystem(
            ' https://petstore3.swagger.io/api/v3/openapi.json'
        );
        const resolved = await resolveOpenAPIOperation(filesystem, {
            method: 'put',
            path: '/pet',
        });

        expect(resolved).toMatchObject({
            servers: [
                {
                    url: '/api/v3',
                },
            ],
            operation: {
                tags: ['pet'],
                summary: 'Update an existing pet.',
                description: 'Update an existing pet by Id.',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'photoUrls'],
                            },
                        },
                    },
                },
            },
        });
    });
});
