import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const cacheLife = mock((_profile: unknown) => {});
const cacheTag = mock((..._tags: string[]) => {});

const realNextCache = await import('next/cache');
mock.module('next/cache', () => ({ ...realNextCache, cacheLife, cacheTag }));

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
        globalThis.fetch = mock(impl);
    }

    function search() {
        return createDataFetcher().searchSiteContent({
            organizationId: 'org-1',
            siteId: 'site-1',
            query: 'test',
            scope: { mode: 'all' },
        });
    }

    it('caches successful results for hours with the site and response tags', async () => {
        mockFetch(async () =>
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

    it('does not cache a transient API error', async () => {
        mockFetch(async () =>
            Response.json({ error: { code: 429, message: 'Namespace saturated' } }, { status: 429 })
        );

        const result = await search();

        expect(result.error?.code).toBe(429);
        expect(cacheLife.mock.calls).toEqual([[{ stale: 0, revalidate: 0, expire: 0 }]]);
    });

    it('does not cache a network failure', async () => {
        mockFetch(() => Promise.reject(new TypeError('fetch failed')));

        const result = await search();

        expect(result.error?.code).toBe(500);
        expect(cacheLife.mock.calls).toEqual([[{ stale: 0, revalidate: 0, expire: 0 }]]);
    });

    it('keeps the default cache life for a stable 404', async () => {
        mockFetch(async () =>
            Response.json({ error: { code: 404, message: 'Site not found' } }, { status: 404 })
        );

        const result = await search();

        expect(result.error?.code).toBe(404);
        expect(cacheLife).not.toHaveBeenCalled();
    });
});
