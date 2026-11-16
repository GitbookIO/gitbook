import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';

const cacheLife = mock((_profile: unknown) => {});
const cacheTag = mock((..._tags: string[]) => {});

const realNextCache = await import('next/cache');
mock.module('next/cache', () => ({ ...realNextCache, cacheLife, cacheTag }));

const realGlobals = await import('@/lib/env/globals');
mock.module('@/lib/env/globals', () => ({
    ...realGlobals,
    GITBOOK_API_URL: 'https://api.example.com/cache/',
}));

const { createDataFetcher } = await import('./api');

const originalFetch = globalThis.fetch;

afterAll(() => mock.restore());

describe('searchSiteContent', () => {
    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    it('reaches the API through the gateway on every search, without caching', async () => {
        const fetchMock = mock((_input: unknown, _init?: RequestInit) =>
            Promise.resolve(Response.json({ items: [] }))
        );
        globalThis.fetch = fetchMock as unknown as typeof fetch;
        const dataFetcher = createDataFetcher({ apiToken: 'site-token' });
        const params = {
            organizationId: 'org-1',
            siteId: 'site-1',
            query: 'test',
            scope: { mode: 'all' as const },
        };

        expect(await dataFetcher.searchSiteContent(params)).toEqual({ data: [] });
        expect(await dataFetcher.searchSiteContent(params)).toEqual({ data: [] });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const [input, init] = fetchMock.mock.calls[0]!;
        expect(String(input)).toBe(
            'https://api.example.com/cache/v1/orgs/org-1/sites/site-1/search'
        );
        expect(new Headers(init?.headers).get('authorization')).toBe('Bearer site-token');
        expect(cacheLife).not.toHaveBeenCalled();
        expect(cacheTag).not.toHaveBeenCalled();
    });
});
