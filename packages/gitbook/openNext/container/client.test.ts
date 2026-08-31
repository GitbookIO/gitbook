import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const { GitbookContainerIncrementalCache } = await import('./incrementalCache');
const { default: tagCache } = await import('./tagCache');
const { default: queue } = await import('./queue');

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

describe('container cache clients', () => {
    const internalFetch = mock();
    const originalInternalFetch = (globalThis as { internalFetch?: typeof fetch }).internalFetch;
    const originalConsoleError = console.error;

    const lastCall = () => internalFetch.mock.calls[internalFetch.mock.calls.length - 1] ?? [];
    const lastUrl = () => new URL(String(lastCall()[0]));
    const lastBody = () => JSON.parse((lastCall()[1] as RequestInit).body as string);

    beforeEach(() => {
        internalFetch.mockReset();
        internalFetch.mockResolvedValue(new Response(null, { status: 204 }));
        (globalThis as { internalFetch?: unknown }).internalFetch = internalFetch;
        console.error = mock();
    });

    afterEach(() => {
        (globalThis as { internalFetch?: unknown }).internalFetch = originalInternalFetch;
        console.error = originalConsoleError;
    });

    it('reads through the intercepted cache host', async () => {
        internalFetch.mockResolvedValue(Response.json({ value: cacheValue, lastModified: 123 }));

        const result = await new GitbookContainerIncrementalCache().get(
            'key with / characters',
            'cache'
        );

        expect(result).toEqual({ value: cacheValue, lastModified: 123 });
        const url = lastUrl();
        expect(url.host).toBe('incremental-cache.internal');
        expect(url.protocol).toBe('http:');
        expect(url.pathname).toBe('/');
        expect(url.searchParams.get('key')).toBe('key with / characters');
        expect(url.searchParams.get('cacheType')).toBe('cache');
    });

    it('returns null for cache misses and failed reads', async () => {
        internalFetch.mockResolvedValue(Response.json(null));
        expect(await new GitbookContainerIncrementalCache().get('missing')).toBeNull();

        internalFetch.mockResolvedValueOnce(new Response(null, { status: 503 }));
        expect(await new GitbookContainerIncrementalCache().get('unavailable-response')).toBeNull();

        internalFetch.mockRejectedValueOnce(new Error('unreachable'));
        expect(await new GitbookContainerIncrementalCache().get('unavailable')).toBeNull();
    });

    it('posts writes and deletes to their own paths', async () => {
        const cache = new GitbookContainerIncrementalCache();

        await cache.set('entry', cacheValue, 'cache');
        expect(lastUrl().pathname).toBe('/set');
        expect(lastBody()).toEqual({ key: 'entry', value: cacheValue, cacheType: 'cache' });

        await cache.delete('entry');
        expect(lastUrl().pathname).toBe('/delete');
        expect(lastBody()).toEqual({ key: 'entry' });
    });

    it('contains mutation failures', async () => {
        internalFetch.mockRejectedValue(new Error('unreachable'));
        const cache = new GitbookContainerIncrementalCache();

        await expect(cache.set('entry', cacheValue, 'cache')).resolves.toBeUndefined();
        await expect(cache.delete('entry')).resolves.toBeUndefined();
    });

    it('writes hard tags only', async () => {
        await tagCache.writeTags([
            'content',
            { tag: 'with-duration', stale: 100, expire: 200 },
            '_N_T_/soft-tag',
        ]);

        expect(lastUrl().pathname).toBe('/write-tags');
        expect(lastBody()).toEqual({
            tags: ['content', { tag: 'with-duration', stale: 100, expire: 200 }],
        });

        internalFetch.mockReset();
        await tagCache.writeTags(['_N_T_/soft-tag']);
        expect(internalFetch).not.toHaveBeenCalled();
    });

    it('sends revalidations to the queue path', async () => {
        await queue.send(revalidationMessage);

        expect(lastUrl().pathname).toBe('/queue');
        expect(lastBody()).toEqual({ msg: revalidationMessage });
    });
});
