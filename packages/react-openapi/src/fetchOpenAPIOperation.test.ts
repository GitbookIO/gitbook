import { it, expect } from 'bun:test';

import { fetchOpenAPIOperation, parseOpenAPIV3 } from './fetchOpenAPIOperation';
import { OpenAPIFetcher } from './types';

const fetcher: OpenAPIFetcher = {
    fetch: async (url) => {
        const response = await fetch(url);
        return parseOpenAPIV3(url, await response.text());
    },
};

it('should resolve refs', async () => {
    const resolved = await fetchOpenAPIOperation(
        {
            url: 'https://petstore3.swagger.io/api/v3/openapi.json',
            method: 'put',
            path: '/pet',
        },
        fetcher,
    );

    expect(resolved).toMatchObject({
        servers: [
            {
                url: '/api/v3',
            },
        ],
        operation: {
            tags: ['pet'],
            summary: 'Update an existing pet',
            description: 'Update an existing pet by Id',
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
    const resolved = await fetchOpenAPIOperation(
        {
            url: 'https://petstore3.swagger.io/api/v3/openapi.yaml',
            method: 'put',
            path: '/pet',
        },
        fetcher,
    );

    expect(resolved).toMatchObject({
        servers: [
            {
                url: '/api/v3',
            },
        ],
        operation: {
            tags: ['pet'],
            summary: 'Update an existing pet',
            description: 'Update an existing pet by Id',
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
    const resolved = await fetchOpenAPIOperation(
        {
            url: 'https://api.gitbook.com/openapi.json',
            method: 'post',
            path: '/search/ask',
        },
        fetcher,
    );

    expect(resolved).toMatchObject({
        servers: [
            {
                url: '{host}/v1',
            },
        ],
        operation: {
            operationId: 'askQuery',
        },
    });
});

it('should resolve to null if the method is not supported', async () => {
    const resolved = await fetchOpenAPIOperation(
        {
            url: 'https://petstore3.swagger.io/api/v3/openapi.json',
            method: 'dontexist',
            path: '/pet',
        },
        fetcher,
    );

    expect(resolved).toBe(null);
});

it('should parse Swagger 2.0', async () => {
    const resolved = await fetchOpenAPIOperation(
        {
            url: 'https://petstore.swagger.io/v2/swagger.json',
            method: 'put',
            path: '/pet',
        },
        fetcher,
    );

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
