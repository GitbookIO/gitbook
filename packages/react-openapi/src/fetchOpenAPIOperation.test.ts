import { it, expect } from 'bun:test';
import { OpenAPIFetcher, fetchOpenAPIOperation } from './fetchOpenAPIOperation';

const fetcher: OpenAPIFetcher = {
    fetch: async (url) => {
        const response = await fetch(url);
        return response.json();
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
