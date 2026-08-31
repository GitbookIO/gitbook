import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const BUILD_ID = 'caller-build-id';

const getCloudflareContext = mock();
mock.module('@opennextjs/cloudflare', () => ({ getCloudflareContext }));

const { GitbookIncrementalCache } = await import('./cacheWorkerClient');
const { CACHE_ORIGIN_SECURE, getReadUrl } = await import('../container/protocol');

const cacheValue = {
    type: 'page' as const,
    html: '<p>cached</p>',
    json: {},
};

const fetchCacheValue = {
    kind: 'FETCH' as const,
    data: { headers: {}, body: 'body', status: 200, url: 'https://example.com' },
    revalidate: 60,
};

describe('GitbookIncrementalCache cache worker client', () => {
    const fetch = mock();
    const set = mock();
    const remove = mock();
    const originalConsoleError = console.error;
    const originalBuildId = process.env.OPEN_NEXT_BUILD_ID;

    beforeEach(() => {
        process.env.OPEN_NEXT_BUILD_ID = BUILD_ID;
        fetch.mockReset();
        set.mockReset();
        remove.mockReset();
        getCloudflareContext.mockReturnValue({
            env: {
                NEXT_INC_CACHE_WORKER: { fetch, set, delete: remove },
            },
        });
        console.error = mock();
    });

    afterEach(() => {
        console.error = originalConsoleError;
        if (originalBuildId === undefined) {
            delete process.env.OPEN_NEXT_BUILD_ID;
        } else {
            process.env.OPEN_NEXT_BUILD_ID = originalBuildId;
        }
    });

    it('gets cache entries through the service binding', async () => {
        fetch.mockResolvedValue(
            Response.json({
                value: cacheValue,
                lastModified: 123,
            })
        );

        const result = await new GitbookIncrementalCache().get('key with / characters', 'cache');

        expect(result).toEqual({ value: cacheValue, lastModified: 123 });
        const request = fetch.mock.calls[0]?.[0] as Request;
        const url = new URL(request.url);
        expect(url.searchParams.get('key')).toBe('key with / characters');
        expect(url.searchParams.get('cacheType')).toBe('cache');
        expect(url.searchParams.get('buildId')).toBe(BUILD_ID);
    });

    it('omits the build ID for entries that are not namespaced per build', async () => {
        fetch.mockResolvedValue(Response.json(null));

        await new GitbookIncrementalCache().get('key', 'composable');
        expect(new URL((fetch.mock.calls[0]?.[0] as Request).url).searchParams.has('buildId')).toBe(
            false
        );

        await new GitbookIncrementalCache().set('key', fetchCacheValue, 'fetch');
        expect(set).toHaveBeenCalledWith('key', fetchCacheValue, 'fetch', undefined);
    });

    // The read URL is the cache worker's edge cache key, so the container tier — which builds it
    // through the same `getReadUrl` — has to land on the exact same string.
    it('reads through the URL shared with the container tier', async () => {
        fetch.mockResolvedValue(Response.json(null));

        await new GitbookIncrementalCache().get('entry', 'cache');

        expect((fetch.mock.calls[0]?.[0] as Request).url).toBe(
            getReadUrl('entry', 'cache', CACHE_ORIGIN_SECURE).toString()
        );
    });

    it('returns null for cache misses and failed reads', async () => {
        fetch.mockResolvedValue(Response.json(null));
        expect(await new GitbookIncrementalCache().get('missing')).toBeNull();

        fetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
        expect(await new GitbookIncrementalCache().get('unavailable-response')).toBeNull();

        fetch.mockRejectedValueOnce(new Error('service unavailable'));
        expect(await new GitbookIncrementalCache().get('unavailable')).toBeNull();
    });

    it('uses RPC for writes and deletes', async () => {
        set.mockResolvedValue(undefined);
        remove.mockResolvedValue(undefined);
        const cache = new GitbookIncrementalCache();

        await cache.set('entry', cacheValue, 'cache');
        await cache.delete('entry');

        expect(set).toHaveBeenCalledWith('entry', cacheValue, 'cache', BUILD_ID);
        expect(remove).toHaveBeenCalledWith('entry', BUILD_ID);
    });

    it('contains mutation failures', async () => {
        set.mockRejectedValue(new Error('service unavailable'));
        remove.mockRejectedValue(new Error('service unavailable'));
        const cache = new GitbookIncrementalCache();

        await expect(cache.set('entry', cacheValue, 'cache')).resolves.toBeUndefined();
        await expect(cache.delete('entry')).resolves.toBeUndefined();
    });
});
