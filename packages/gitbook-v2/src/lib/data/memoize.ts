import pMemoize, { type CacheStorage } from 'p-memoize';
import { getCloudflareContext } from './cloudflare';

/**
 * We wrap 'use cache' calls in a p-memoize function to avoid
 * executing the function multiple times when doing concurrent calls.
 *
 * Hopefully one day this can be done directly by 'use cache'.
 */
export function memoize<F extends (...args: any[]) => any>(f: F): F {
    const getFunctionCache = async () => {
        const functionsCache = await getRequestCacheMap();
        const cache = functionsCache.get(f);
        if (cache) {
            return cache;
        }

        const newCache = new Map<string, unknown>();
        functionsCache.set(f, newCache);
        return newCache;
    };

    return pMemoize(f, {
        cacheKey: (args) => {
            return JSON.stringify(deepSortValue(args));
        },
        /**
         * Cache storage that is scoped to the current request when executed in Cloudflare Workers,
         * to avoid "Cannot perform I/O on behalf of a different request" errors.
         */
        cache: {
            has: async (key) => {
                const cache = await getFunctionCache();
                return cache.has(key);
            },
            get: async (key) => {
                const cache = await getFunctionCache();
                return cache.get(key);
            },
            set: async (key, value) => {
                const cache = await getFunctionCache();
                cache.set(key, value);
            },
            delete: async (key) => {
                const cache = await getFunctionCache();
                cache.delete(key);
            },
            clear: async () => {
                const cache = await getFunctionCache();
                cache.clear?.();
            },
        },
    });
}

const globalCache = new WeakMap<any, CacheStorage<string, unknown>>();
const perRequestCache = new WeakMap<object, WeakMap<any, CacheStorage<string, unknown>>>();

/**
 * Get the cache storage for the current request.
 */
async function getRequestCacheMap(): Promise<WeakMap<any, CacheStorage<string, unknown>>> {
    const cloudflareContext = await getCloudflareContext();
    if (cloudflareContext) {
        // `cf` changes for each request, so we use a per-request cache
        const requestCache = perRequestCache.get(cloudflareContext.cf);
        if (requestCache) {
            return requestCache;
        }

        const newRequestCache = new WeakMap<any, CacheStorage<string, unknown>>();
        perRequestCache.set(cloudflareContext.cf, newRequestCache);
        return newRequestCache;
    }

    return globalCache;
}

function deepSortValue(value: unknown): unknown {
    if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        value === undefined
    ) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map(deepSortValue);
    }

    if (value && typeof value === 'object') {
        return Object.entries(value)
            .map(([key, subValue]) => {
                return [key, deepSortValue(subValue)] as const;
            })
            .sort((a, b) => {
                return a[0].localeCompare(b[0]);
            });
    }

    return value;
}
