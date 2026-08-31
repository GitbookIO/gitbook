import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

import { handleCacheOutbound } from './containerOutbound';

const cacheValue = {
    type: 'page' as const,
    html: '<p>cached</p>',
    json: {},
};

const revalidationMessage = {
    MessageDeduplicationId: 'dedup',
    MessageBody: { host: 'example.com', url: '/docs', lastModified: 1, eTag: 'etag' },
    MessageGroupId: 'group',
};

const post = (path: string, payload: unknown) =>
    new Request(`http://incremental-cache.internal${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    });

describe('handleCacheOutbound', () => {
    const fetch = mock();
    const set = mock();
    const remove = mock();
    const writeTags = mock();
    const enqueueRevalidation = mock();
    const originalConsoleError = console.error;

    const env = () => ({
        NEXT_INC_CACHE_WORKER: { fetch, set, delete: remove, writeTags, enqueueRevalidation },
    });

    beforeEach(() => {
        for (const m of [fetch, set, remove, writeTags, enqueueRevalidation]) {
            m.mockReset();
        }
        fetch.mockResolvedValue(new Response(null, { status: 204 }));
        console.error = mock();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('forwards reads to the cache worker with the https scheme restored', async () => {
        fetch.mockResolvedValue(Response.json({ value: cacheValue, lastModified: 123 }));

        const response = await handleCacheOutbound(
            new Request('http://incremental-cache.internal/?key=entry&cacheType=cache'),
            env()
        );

        expect(await response.json<unknown>()).toEqual({ value: cacheValue, lastModified: 123 });
        // The workerd tier sends the same URL, so both tiers share one edge cache entry.
        expect((fetch.mock.calls[0]?.[0] as Request).url).toBe(
            'https://incremental-cache.internal/?key=entry&cacheType=cache'
        );
    });

    it('maps write paths onto the service binding RPC methods', async () => {
        await handleCacheOutbound(
            post('/set', {
                key: 'entry',
                value: cacheValue,
                cacheType: 'cache',
                buildId: 'caller-build-id',
            }),
            env()
        );
        expect(set).toHaveBeenCalledWith('entry', cacheValue, 'cache', 'caller-build-id');

        await handleCacheOutbound(
            post('/delete', { key: 'entry', buildId: 'caller-build-id' }),
            env()
        );
        expect(remove).toHaveBeenCalledWith('entry', 'caller-build-id');

        await handleCacheOutbound(post('/write-tags', { tags: ['content'] }), env());
        expect(writeTags).toHaveBeenCalledWith(['content']);

        await handleCacheOutbound(post('/queue', { msg: revalidationMessage }), env());
        expect(enqueueRevalidation).toHaveBeenCalledWith(revalidationMessage);
    });

    it('returns 404 for unknown paths', async () => {
        const response = await handleCacheOutbound(post('/unknown', {}), env());

        expect(response.status).toBe(404);
    });

    it('returns 502 when the cache worker fails', async () => {
        set.mockRejectedValue(new Error('service unavailable'));

        const response = await handleCacheOutbound(
            post('/set', { key: 'entry', value: cacheValue }),
            env()
        );

        expect(response.status).toBe(502);
    });

    it('returns 503 when the service binding is missing', async () => {
        const response = await handleCacheOutbound(
            new Request('http://incremental-cache.internal/?key=entry'),
            {} as never
        );

        expect(response.status).toBe(503);
    });
});
