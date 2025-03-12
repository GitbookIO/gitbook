import { AsyncLocalStorage } from 'node:async_hooks';

const symbolResponseCacheTagsLocalStorage = Symbol.for('__gitbook-response-cache-tags__');

/**
 * Wrap a response handler with a storage to store cache tags and write them as header to the response.
 */
export async function withResponseCacheTags(handler: () => Promise<Response>): Promise<Response> {
    const responseCacheTagsLocalStorage =
        // @ts-ignore
        (globalThis[symbolResponseCacheTagsLocalStorage] as AsyncLocalStorage<Set<string>>) ??
        new AsyncLocalStorage<Set<string>>();
    // @ts-ignore
    globalThis[symbolResponseCacheTagsLocalStorage] = responseCacheTagsLocalStorage;

    const responseCacheTags = new Set<string>();
    const response = await responseCacheTagsLocalStorage.run(responseCacheTags, handler);

    if (responseCacheTags.size > 0) {
        const headerCacheTag = Array.from(responseCacheTags).join(',');
        response.headers.set('cache-tag', headerCacheTag);
        response.headers.set('x-gitbook-cache-tag', headerCacheTag);
    }

    return response;
}

/**
 * Add a cache tag to the HTTP response.
 * This is a hack for v1, for v2, we use ISR and do not cache the whole response.
 */
export function addResponseCacheTag(...tags: string[]) {
    const responseCacheTagsLocalStorage =
        // @ts-ignore
        (globalThis[symbolResponseCacheTagsLocalStorage] as AsyncLocalStorage<Set<string>>) ??
        new AsyncLocalStorage<Set<string>>();
    // @ts-ignore
    globalThis[symbolResponseCacheTagsLocalStorage] = responseCacheTagsLocalStorage;

    const store = responseCacheTagsLocalStorage.getStore();
    tags.forEach((tag) => {
        store?.add(tag);
    });
}
