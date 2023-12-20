import hash from 'object-hash';

import { memoryCache } from './memory';
import { redisCache } from './redis';
import { CacheEntry } from './types';

export type CacheFunction<Args extends any[], Result> = ((...args: Args) => Promise<Result>) & {
    /**
     * Refetch the data and update the cache.
     */
    revalidate: (...args: Args) => Promise<void>;
};

/**
 * Caches created by the `cache` function.
 */
const registeredCaches = new Map<string, CacheFunction<any[], any>>();

export interface CacheResult<Result> {
    data: Result;

    /**
     * Time to live in seconds.
     * @default 60 * 60 * 24
     */
    ttl?: number;

    /**
     * Tags to associate with the cache entry.
     */
    tags?: string[];
}

/**
 * Cache data from an async function.
 * We don't use the next.js cache because it has a 2MB limit.
 */
export function cache<Args extends any[], Result>(
    cacheName: string,
    fn: (...args: Args) => Promise<CacheResult<Result>>,
    options: {
        /** Filter the arguments that should be taken into consideration for cachine */
        extractArgs?: (args: Args) => any[];
    } = {},
): CacheFunction<Args, Result> {
    const revalidate = async (key: string, ...args: Args) => {
        const startTime = now();

        // Fetch upstream
        const result = await fn(...args);
        const fetchDuration = now() - startTime;

        const cacheEntry: CacheEntry = {
            data: result.data,
            meta: {
                cache: cacheName,
                tags: result.tags ?? [],
                expiresAt: Date.now() + (result.ttl ?? 60 * 60 * 24) * 1000,
                args,
                hits: 1,
            },
        };

        // Write it to the cache
        // As soon as it'll be possible with next-on-pages, we should `waitUntil`
        // to delay writing the cache after the response has been sent to the client.
        if (result.ttl && result.ttl > 0) {
            await setCacheEntry(key, cacheEntry);
        }
        const writeCacheDuration = now() - startTime - fetchDuration;

        return {
            data: result.data,
            fetchDuration,
            writeCacheDuration,
        };
    };

    const fetchValue = async (key: string, ...args: Args) => {
        // Read the cache
        const startTime = now();
        const hasMemoryHit = !!(await memoryCache.get(key));
        const cachedEntry = await getCacheEntry(key);
        const readCacheDuration = now() - startTime;

        // Returns it if it exists
        if (cachedEntry !== null) {
            console.log(
                `cache: ${key} hit in ${readCacheDuration.toFixed(
                    0,
                )}ms (memory: ${hasMemoryHit}, redis: ${!!redisCache})`,
            );
            return cachedEntry.data;
        }

        const fetched = await revalidate(key, ...args);
        console.log(
            `cache: ${key} miss in ${fetched.fetchDuration.toFixed(
                0,
            )}ms, read in ${readCacheDuration.toFixed(
                0,
            )}ms, write in ${fetched.writeCacheDuration.toFixed(0)}ms (redis: ${!!redisCache})`,
        );

        return fetched.data;
    };

    // During development, for now it fetches data twice between the middleware and the handler.
    // TODO: find a way to share the cache between the two.

    const pendings = new Map<string, Promise<any>>();

    const cacheFn = async (...args: Args) => {
        const cacheArgs = options.extractArgs ? options.extractArgs(args) : args;
        const key = getCacheKey(cacheName, cacheArgs);

        // If a pending request exists, wait for it
        if (pendings.has(key)) {
            return await pendings.get(key);
        }

        // Otherwise, fetch the value
        const promise = fetchValue(key, ...args);
        pendings.set(key, promise);

        // Remove the pending request once it's done
        try {
            const result = await promise;
            return result;
        } finally {
            pendings.delete(key);
        }
    };

    cacheFn.revalidate = async (...args: Args) => {
        const cacheArgs = options.extractArgs ? options.extractArgs(args) : args;
        const key = getCacheKey(cacheName, cacheArgs);

        await revalidate(key, ...args);
    };

    // @ts-ignore
    registeredCaches.set(cacheName, cacheFn);

    return cacheFn;
}

/**
 * Get a cache function by its name.
 */
export function getCache(name: string): CacheFunction<any[], any> | null {
    // @ts-ignore
    return registeredCaches.get(name) ?? null;
}

function getCacheKey(fnName: string, args: any[]) {
    let innerKey = args.map((arg) => JSON.stringify(arg)).join(',');

    // Avoid crazy long keys, by fallbacking to a hash
    if (innerKey.length > 128) {
        innerKey = hash(args);
    }

    return `${fnName}(${innerKey})`;
}

async function setCacheEntry(key: string, entry: CacheEntry) {
    await Promise.all([memoryCache.set(key, entry), redisCache?.set(key, entry)]);
}

async function getCacheEntry(key: string): Promise<CacheEntry | null> {
    const memoryEntry = await memoryCache.get(key);
    if (memoryEntry) {
        return memoryEntry;
    }

    try {
        const redisEntry = (await redisCache?.get(key)) ?? null;
        if (redisEntry) {
            await memoryCache.set(key, redisEntry);
        }

        return redisEntry;
    } catch (error) {
        console.error(`Error while getting cache entry for ${key} from redis`, error);
        return null;
    }
}

function now(): number {
    // Local Next.js development doesn't have performance.now()
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
