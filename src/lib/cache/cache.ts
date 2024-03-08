import * as Sentry from '@sentry/nextjs';
import hash from 'object-hash';

import { cacheBackends } from './backends';
import { CacheEntry } from './types';
import { race } from '../async';
import { getGlobalContext, waitUntil } from '../waitUntil';

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
        /** Filter the arguments that should be taken into consideration for caching */
        extractArgs?: (args: Args) => any[];

        /** Default ttl (in seconds) */
        defaultTtl?: number;
    } = {},
): CacheFunction<Args, Result> {
    const revalidate = async (key: string, ...args: Args) => {
        return await Sentry.startSpan(
            {
                name: `cache.revalidate(${key})`,
                op: 'cache.revalidate',
                attributes: {
                    cacheKey: key,
                },
            },
            async (trace) => {
                const startTime = now();

                // Fetch upstream
                const result = await fn(...args);
                const fetchDuration = now() - startTime;

                const cacheEntry: CacheEntry = {
                    data: result.data,
                    meta: {
                        cache: cacheName,
                        tags: result.tags ?? [],
                        expiresAt:
                            Date.now() + (result.ttl ?? options.defaultTtl ?? 60 * 60 * 24) * 1000,
                        args,
                        hits: 1,
                    },
                };

                trace?.setAttribute('cacheTtl', result.ttl ?? 0);

                // Write it to the cache
                if (result.ttl && result.ttl > 0) {
                    await waitUntil(setCacheEntry(key, cacheEntry));
                }
                const writeCacheDuration = now() - startTime - fetchDuration;

                return {
                    data: result.data,
                    fetchDuration,
                    writeCacheDuration,
                };
            },
        );
    };

    const fetchValue = async (key: string, ...args: Args) => {
        return await Sentry.startSpan(
            {
                name: `cache.fetch(${key})`,
                op: 'cache.fetch',
                attributes: {
                    cacheKey: key,
                },
            },
            async (trace) => {
                // Read the cache
                const startTime = now();
                const cachedEntry = await getCacheEntry(key);
                const readCacheDuration = now() - startTime;

                trace?.setAttribute('cacheStatus', cachedEntry ? 'hit' : 'miss');

                // Returns it if it exists
                if (cachedEntry !== null) {
                    console.log(
                        `cache: ${key} hit on ${cachedEntry[1]} in ${readCacheDuration.toFixed(
                            0,
                        )}ms`,
                    );
                    return cachedEntry[0].data;
                }

                try {
                    const fetched = await revalidate(key, ...args);
                    console.log(
                        `cache: ${key} miss in ${fetched.fetchDuration.toFixed(
                            0,
                        )}ms, read in ${readCacheDuration.toFixed(
                            0,
                        )}ms, write in ${fetched.writeCacheDuration.toFixed(0)}ms`,
                    );

                    return fetched.data;
                } catch (error) {
                    console.error(`cache: ${key} error: ${error}`);
                    throw error;
                }
            },
        );
    };

    // During development, for now it fetches data twice between the middleware and the handler.
    // TODO: find a way to share the cache between the two.

    // On Cloudflare Workers, we can't share promises between requests:
    // > Cannot perform I/O on behalf of a different request. I/O objects (such as streams, request/response bodies, and others)
    // > created in the context of one request handler cannot be accessed from a different request's handler.
    //
    // To avoid this limitation and still avoid concurrent requests, we use a WeakMap to store the pending requests.
    const contextPendings = new WeakMap<object, Map<string, Promise<any>>>();

    const cacheFn = async (...args: Args) => {
        const cacheArgs = options.extractArgs ? options.extractArgs(args) : args;
        const key = getCacheKey(cacheName, cacheArgs);

        return await Sentry.startSpan(
            {
                name: `cache.get(${key})`,
                op: 'cache.get',
                attributes: {
                    cacheKey: key,
                    functionArgs: JSON.stringify(cacheArgs),
                },
            },
            async (trace) => {
                const context = await getGlobalContext();
                const pendings = contextPendings.get(context) ?? new Map<string, Promise<any>>();
                contextPendings.set(context, pendings);

                // @ts-ignore
                trace?.setAttribute('cacheContextTlsClientRandom', context.tlsClientRandom);

                // If a pending request exists, wait for it
                if (pendings.has(key)) {
                    trace?.setAttribute('cacheStatus', 'pending');
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
            },
        );
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

/**
 * Get a cache key for a function and its arguments.
 */
export function getCacheKey(fnName: string, args: any[]) {
    let innerKey = args.map((arg) => JSON.stringify(arg)).join(',');

    // Avoid crazy long keys, by fallbacking to a hash
    if (innerKey.length > 128) {
        innerKey = hash(args);
    }

    return `${fnName}(${innerKey})`;
}

async function setCacheEntry(key: string, entry: CacheEntry) {
    return await Sentry.startSpan(
        {
            name: `cache.setCacheEntry(${key})`,
            op: 'cache.setCacheEntry',
            attributes: {
                cacheKey: key,
            },
        },
        async () => {
            await Promise.all(cacheBackends.map((backend) => backend.set(key, entry)));
        },
    );
}

async function getCacheEntry(key: string): Promise<readonly [CacheEntry, string] | null> {
    return await Sentry.startSpan(
        {
            name: `cache.getCacheEntry(${key})`,
            op: 'cache.getCacheEntry',
            attributes: {
                cacheKey: key,
            },
        },
        async (trace) => {
            const result = await race(
                cacheBackends,
                async (backend, { signal }) => {
                    const entry = await backend.get(key, { signal });
                    return entry ? ([entry, backend.name] as const) : null;
                },
                {
                    timeout: 200,
                },
            );

            trace?.setAttribute('cacheStatus', result ? 'hit' : 'miss');

            // Write to the fallback caches
            if (result) {
                const [savedEntry, backendName] = result as [CacheEntry, string];
                trace?.setAttribute('cacheBackend', backendName);

                await waitUntil(
                    Promise.all(
                        cacheBackends
                            .filter((backend) => backend.name !== backendName && backend.fallback)
                            .map((backend) => backend.set(key, savedEntry)),
                    ),
                );
            }

            return result;
        },
    );
}

function now(): number {
    // Local Next.js development doesn't have performance.now()
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
