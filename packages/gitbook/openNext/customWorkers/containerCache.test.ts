import { beforeEach, describe, expect, it, mock } from 'bun:test';

const runWithCloudflareRequestContext = mock(
    async <T>(_: Request, __: unknown, ___: unknown, operation: () => Promise<T>) => operation()
);
const get = mock();
const getTagsFromValue = mock();
const hasBeenRevalidated = mock();

mock.module('cloudflare:workers', () => ({
    DurableObject: class {},
    WorkerEntrypoint: class {},
}));
mock.module('../../.open-next/cloudflare/init.js', () => ({ runWithCloudflareRequestContext }));
mock.module('../incrementalCache/incrementalCache', () => ({
    GitbookIncrementalCache: class {
        get = get;
    },
}));
mock.module('@opennextjs/aws/utils/cache.js', () => ({ getTagsFromValue }));
mock.module('../tagCache/middleware', () => ({
    default: { hasBeenRevalidated },
}));

const { IncrementalCacheWorker } = await import('./containerCache');

const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';
const NO_STORE_CACHE_CONTROL = 'private, no-store, max-age=0, must-revalidate';

const cacheValue = {
    type: 'page' as const,
    html: '<p>cached</p>',
    json: {},
    revalidate: 60,
};

describe('IncrementalCacheWorker fetch', () => {
    const selfFetch = mock();

    beforeEach(() => {
        selfFetch.mockReset();
        get.mockReset();
        getTagsFromValue.mockReset();
        hasBeenRevalidated.mockReset();
        getTagsFromValue.mockReturnValue(['space:1']);
        hasBeenRevalidated.mockResolvedValue(false);
    });

    const fetch = (request: Request) =>
        IncrementalCacheWorker.prototype.fetch.call(
            {
                env: { WORKER_SELF_REFERENCE: { fetch: selfFetch } },
                ctx: {},
            },
            request
        );

    it('forwards cache reads to the internal endpoint and restores cache metadata', async () => {
        selfFetch.mockResolvedValue(
            Response.json(
                { value: cacheValue, lastModified: 123 },
                {
                    headers: {
                        'x-gitbook-cache-control': CACHE_CONTROL,
                        'x-gitbook-cache-tag': 'incremental-cache:entry,space:1',
                    },
                }
            )
        );

        const response = await fetch(
            new Request('https://incremental-cache.internal/?key=entry&cacheType=cache')
        );

        expect(response.headers.get('cache-control')).toBe(CACHE_CONTROL);
        expect(response.headers.get('cache-tag')).toBe('incremental-cache:entry,space:1');
        const forwardedRequest = selfFetch.mock.calls[0]?.[0] as Request;
        const forwardedURL = new URL(forwardedRequest.url);
        expect(forwardedURL.pathname).toBe('/internal');
        expect(forwardedURL.searchParams.get('key')).toBe('entry');
        expect(forwardedURL.searchParams.get('cacheType')).toBe('cache');
    });

    it('reads and annotates a cache hit only on the internal endpoint', async () => {
        get.mockResolvedValue({ value: cacheValue, lastModified: Date.now() });

        const response = await fetch(
            new Request('https://incremental-cache.internal/internal?key=entry&cacheType=cache')
        );

        expect(get).toHaveBeenCalledWith('entry', 'cache');
        expect(selfFetch).not.toHaveBeenCalled();
        expect(response.headers.get('cache-control')).toBe(CACHE_CONTROL);
        expect(response.headers.get('x-gitbook-cache-control')).toBe(CACHE_CONTROL);
        expect(response.headers.get('cache-tag')).toBe('incremental-cache:entry,space:1');
        expect(response.headers.get('x-gitbook-cache-tag')).toBe('incremental-cache:entry,space:1');
    });

    it('keeps cache misses out of the worker cache', async () => {
        get.mockResolvedValue(null);

        const response = await fetch(
            new Request('https://incremental-cache.internal/internal?key=missing')
        );

        expect(response.headers.get('cache-control')).toBe(NO_STORE_CACHE_CONTROL);
        expect(response.headers.get('x-gitbook-cache-control')).toBe(NO_STORE_CACHE_CONTROL);
        expect(await response.json()).toBeNull();
    });

    it('keeps revalidated and stale entries out of the worker cache', async () => {
        get.mockResolvedValueOnce({ value: cacheValue, lastModified: Date.now() });
        hasBeenRevalidated.mockResolvedValueOnce(true);
        const revalidatedResponse = await fetch(
            new Request('https://incremental-cache.internal/internal?key=revalidated')
        );

        get.mockResolvedValueOnce({
            value: { ...cacheValue, revalidate: 0 },
            lastModified: Date.now() - 1_000,
        });
        const staleResponse = await fetch(
            new Request('https://incremental-cache.internal/internal?key=stale')
        );

        expect(revalidatedResponse.headers.get('cache-control')).toBe(NO_STORE_CACHE_CONTROL);
        expect(revalidatedResponse.headers.get('x-gitbook-cache-revalidated')).toBe('true');
        expect(staleResponse.headers.get('cache-control')).toBe(NO_STORE_CACHE_CONTROL);
        expect(staleResponse.headers.get('x-gitbook-cache-revalidated')).toBe('true');
    });

    it('restores the native Request after entering the OpenNext context', async () => {
        const NativeRequest = globalThis.Request;
        // The real `runWithCloudflareRequestContext` swaps the global for a subclass, which breaks
        // the `instanceof Request` check in @cloudflare/containers on the container proxy path.
        runWithCloudflareRequestContext.mockImplementationOnce(
            async <T>(_: Request, __: unknown, ___: unknown, operation: () => Promise<T>) => {
                globalThis.Request = class extends NativeRequest {} as typeof Request;
                return operation();
            }
        );
        get.mockResolvedValue(null);

        await fetch(new Request('https://incremental-cache.internal/internal?key=entry'));

        expect(globalThis.Request).toBe(NativeRequest);
    });

    it('rejects invalid internal requests and does not forward non-GET requests', async () => {
        const invalidResponse = await fetch(
            new Request('https://incremental-cache.internal/internal?key=entry&cacheType=invalid')
        );
        const methodResponse = await fetch(
            new Request('https://incremental-cache.internal/?key=entry', { method: 'POST' })
        );

        expect(invalidResponse.status).toBe(400);
        expect(methodResponse.status).toBe(405);
        expect(selfFetch).not.toHaveBeenCalled();
    });
});
