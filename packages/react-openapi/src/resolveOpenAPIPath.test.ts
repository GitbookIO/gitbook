import { it, expect } from 'bun:test';

import { resolveOpenAPIPath } from './resolveOpenAPIPath';
import { OpenAPIFetcher } from './types';

const createFetcherForSchema = (schema: any): OpenAPIFetcher => {
    return {
        fetch: async (url) => {
            return schema;
        },
    };
};

it('should resolve a simple path through objects', async () => {
    const resolved = await resolveOpenAPIPath(
        'https://test.com',
        ['a', 'b', 'c'],
        createFetcherForSchema({
            a: {
                b: {
                    c: 'hello',
                },
            },
        }),
    );

    expect(resolved).toBe('hello');
});

it('should return undefined if the last part of the path does not exists', async () => {
    const resolved = await resolveOpenAPIPath(
        'https://test.com',
        ['a', 'b', 'c'],
        createFetcherForSchema({
            a: {
                b: {
                    d: 'hello',
                },
            },
        }),
    );

    expect(resolved).toBe(undefined);
});

it('should return undefined if a middle part of the path does not exists', async () => {
    const resolved = await resolveOpenAPIPath(
        'https://test.com',
        ['a', 'x', 'c'],
        createFetcherForSchema({
            a: {
                b: {
                    c: 'hello',
                },
            },
        }),
    );

    expect(resolved).toBe(undefined);
});
