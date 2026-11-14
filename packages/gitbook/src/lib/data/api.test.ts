import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const cacheLife = mock((_profile: unknown) => {});
const cacheTag = mock((..._tags: string[]) => {});

const realNextCache = await import('next/cache');
mock.module('next/cache', () => ({ ...realNextCache, cacheLife, cacheTag }));

const realGlobals = await import('@/lib/env/globals');
mock.module('@/lib/env/globals', () => ({
    ...realGlobals,
    GITBOOK_API_URL: 'https://api.example.com/cache/',
    GITBOOK_API_URL_WITHOUT_GATEWAY: realGlobals.removeAPIGatewayPath(
        'https://api.example.com/cache/'
    ),
}));

const { createDataFetcher } = await import('./api');

const originalFetch = globalThis.fetch;

afterAll(() => mock.restore());

describe('searchSiteContent', () => {
    beforeEach(() => {
        cacheLife.mockClear();
        cacheTag.mockClear();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    function mockFetch(impl: () => Promise<Response>) {
        const fetchMock = mock((_input: unknown, _init?: RequestInit) => impl());
        globalThis.fetch = fetchMock as unknown as typeof fetch;
        return fetchMock;
    }

    const dataFetcher = createDataFetcher({ apiToken: 'site-token' });

    function search() {
        return dataFetcher.searchSiteContent({
            organizationId: 'org-1',
            siteId: 'site-1',
            query: 'test',
            scope: { mode: 'all' },
        });
    }

    it('calls the API without the gateway, with the site token and a timeout', async () => {
        const fetchMock = mockFetch(async () =>
            Response.json({ items: [] }, { headers: { 'x-gitbook-cache-tag': 'space:space-1' } })
        );

        const result = await search();

        expect(result).toEqual({ data: [] });
        const [input, init] = fetchMock.mock.calls[0]!;
        expect(String(input)).toBe('https://api.example.com/v1/orgs/org-1/sites/site-1/search');
        expect(new Headers(init?.headers).get('authorization')).toBe('Bearer site-token');
        expect(init?.signal).toBeInstanceOf(AbortSignal);
        expect(cacheLife).not.toHaveBeenCalled();
        expect(cacheTag).not.toHaveBeenCalled();
    });

    it('leaves other API calls on the gateway', async () => {
        const fetchMock = mockFetch(async () => Response.json({ id: 'user-1' }));

        await dataFetcher.getUserById('user-1');

        expect(String(fetchMock.mock.calls[0]![0])).toBe(
            'https://api.example.com/cache/v1/users/user-1'
        );
    });

    it('returns an API error as a value', async () => {
        mockFetch(async () =>
            Response.json({ error: { code: 429, message: 'Namespace saturated' } }, { status: 429 })
        );

        const result = await search();

        expect(result.error?.code).toBe(429);
    });
});
