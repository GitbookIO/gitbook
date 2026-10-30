import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const cacheLife = mock((_profile: unknown) => {});
const cacheTag = mock((..._tags: string[]) => {});

const realNextCache = await import('next/cache');
mock.module('next/cache', () => ({ ...realNextCache, cacheLife, cacheTag }));

const { createDataFetcher } = await import('./api');

const originalFetch = globalThis.fetch;

afterAll(() => mock.restore());

describe('searchSiteContent', () => {
    let queryIndex = 0;

    beforeEach(() => {
        cacheLife.mockClear();
        cacheTag.mockClear();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    function mockAPIResponse(response: Response | Promise<Response>) {
        globalThis.fetch = mock(() => Promise.resolve(response)) as unknown as typeof fetch;
    }

    function search() {
        // A distinct query per test, so no call can be served from React's per-request cache.
        return createDataFetcher().searchSiteContent({
            organizationId: 'org-1',
            siteId: 'site-1',
            query: `query-${queryIndex++}`,
            scope: { mode: 'all' },
        });
    }

    it('caches successful results for hours with the site and response tags', async () => {
        mockAPIResponse(
            Response.json(
                { items: [] },
                { headers: { 'x-gitbook-cache-tag': 'space:space-1,space:space-2' } }
            )
        );

        const result = await search();

        expect(result).toEqual({ data: [] });
        expect(cacheLife.mock.calls).toEqual([['hours']]);
        expect(cacheTag.mock.calls.flat()).toEqual([
            'site:site-1',
            'space:space-1',
            'space:space-2',
        ]);
    });

    it.each([429, 500, 503])('does not cache a %i from the API', async (status) => {
        mockAPIResponse(
            Response.json({ error: { code: status, message: 'Namespace saturated' } }, { status })
        );

        const result = await search();

        expect(result.error?.code).toBe(status);
        expect(cacheLife.mock.calls).toEqual([[{ stale: 0, revalidate: 0, expire: 0 }]]);
    });

    it('does not cache a network failure', async () => {
        globalThis.fetch = mock(() =>
            Promise.reject(new TypeError('fetch failed'))
        ) as unknown as typeof fetch;

        const result = await search();

        expect(result.error?.code).toBe(500);
        expect(cacheLife.mock.calls).toEqual([[{ stale: 0, revalidate: 0, expire: 0 }]]);
    });

    it('keeps the default cache life for a stable 404', async () => {
        mockAPIResponse(
            Response.json({ error: { code: 404, message: 'Site not found' } }, { status: 404 })
        );

        const result = await search();

        expect(result.error?.code).toBe(404);
        expect(cacheLife).not.toHaveBeenCalled();
    });
});
