import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const getCloudflareContext = mock();
mock.module('@opennextjs/cloudflare', () => ({ getCloudflareContext }));

const { GitbookIncrementalCache } = await import('./cacheWorkerClient');

const cacheValue = {
    type: 'page' as const,
    html: '<p>cached</p>',
    json: {},
};

describe('GitbookIncrementalCache cache worker client', () => {
    const fetch = mock();
    const set = mock();
    const remove = mock();
    const originalConsoleError = console.error;

    beforeEach(() => {
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

        expect(set).toHaveBeenCalledWith('entry', cacheValue, 'cache');
        expect(remove).toHaveBeenCalledWith('entry');
    });

    it('contains mutation failures', async () => {
        set.mockRejectedValue(new Error('service unavailable'));
        remove.mockRejectedValue(new Error('service unavailable'));
        const cache = new GitbookIncrementalCache();

        await expect(cache.set('entry', cacheValue, 'cache')).resolves.toBeUndefined();
        await expect(cache.delete('entry')).resolves.toBeUndefined();
    });
});
