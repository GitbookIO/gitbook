import hash from 'object-hash';

import { cacheBackends } from './backends';
import { CacheEntry } from './types';
import { race } from '../async';
import { TraceSpan, trace } from '../tracing';
import { getGlobalContext, waitUntil } from '../waitUntil';

export type CacheFunctionOptions = {
    signal: AbortSignal | undefined;
};

export type CacheFunction<Args extends any[], Result> = ((
    ...args: Args | [...Args, CacheFunctionOptions]
) => Promise<Result>) & {
    /**
     * Refetch the data and update the cache.
     */
    revalidate: (...args: Args | [...Args, CacheFunctionOptions]) => Promise<void>;
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
    fn: (...args: [...Args, CacheFunctionOptions]) => Promise<CacheResult<Result>>,
    options: {
        /** Filter the arguments that should be taken into consideration for caching */
        extractArgs?: (args: Args) => any[];

        /** Default ttl (in seconds) */
        defaultTtl?: number;
    } = {},
): CacheFunction<Args, Result> {
    const revalidate = async (signal: AbortSignal | undefined, key: string, ...args: Args) => {
        return await trace(
            {
                name: key,
                operation: `cache.revalidate`,
            },
            async (span) => {
                // Fetch upstream
                const result = await fn(...args, { signal });
                signal?.throwIfAborted();

                const cacheEntry: CacheEntry = {
                    data: result.data,
                    meta: {
                        cache: cacheName,
                        tags: result.tags ?? [],
                        expiresAt:
                            Date.now() + (result.ttl ?? options.defaultTtl ?? 60 * 60 * 24) * 1000,
                        args,
                    },
                };

                span.setAttribute('cacheTtl', result.ttl ?? 0);

                // Write it to the cache
                if (result.ttl && result.ttl > 0) {
                    await waitUntil(setCacheEntry(key, cacheEntry));
                }

                return cacheEntry;
            },
        );
    };

    const fetchValue = async (
        signal: AbortSignal | undefined,
        span: TraceSpan,
        key: string,
        ...args: Args
    ) => {
        const timeStart = now();
        let readCacheDuration = 0;
        let fetchDuration = 0;

        let result: readonly [CacheEntry, string] | null = null;

        // Try the memory backend, independently of the other backends as it doesn't have a network cost
        const memoryEntry = await cacheBackends
            .find((backend) => backend.name === 'memory')
            ?.get(key);
        if (memoryEntry) {
            span.setAttribute('memory', true);
            result = [memoryEntry, 'memory'] as const;
        } else {
            result = await race(
                cacheBackends,
                async (backend, { signal }) => {
                    const entry = await backend.get(key, { signal });
                    return entry ? ([entry, backend.name] as const) : null;
                },
                {
                    signal,

                    // We stop everything after 10s to avoid pending requests
                    timeout: 10 * 1000,

                    // We give 70ms to the caches to respond, otherwise we start fallbacking to the actual fetch
                    // It should represents a bit more than the 90th percentile of the KV cache response time
                    blockTimeout: 70,

                    blockFallback: async (fallbackOps) => {
                        const timeFetch = now();
                        const upstream = await revalidate(fallbackOps.signal, key, ...args);

                        readCacheDuration = timeFetch - timeStart;
                        fetchDuration = now() - timeFetch;
                        return [upstream, 'fetch'] as const;
                    },

                    // If no entry is found in the cache backends, we fallback to the fetch
                    fallbackOnNull: true,
                },
            );
        }

        if (!readCacheDuration) {
            readCacheDuration = now() - timeStart;
        }

        if (!result) {
            throw new Error(`Failed to fetch the value "${key}", timeout exceeded`);
        }

        const [savedEntry, backendName] = result;
        span.setAttribute('cacheBackend', backendName);

        const cacheStatus: 'miss' | 'hit' = backendName === 'fetch' ? 'miss' : 'hit';
        span.setAttribute('cacheStatus', cacheStatus);

        // Replicate to other backends if needed
        const fromBackend = cacheBackends.find((backend) => backend.name === backendName);
        if (cacheStatus === 'miss' || fromBackend?.replication !== 'local') {
            await waitUntil(
                Promise.all(
                    cacheBackends
                        .filter((backend) => backend.name !== backendName)
                        .map((backend) => backend.set(key, savedEntry)),
                ),
            );
        }

        const totalDuration = now() - timeStart;

        // Log
        console.log(
            `cache: ${key} ${cacheStatus}${
                cacheStatus === 'hit' ? ` on ${backendName}` : ''
            } in total ${totalDuration.toFixed(0)}ms, fetch in ${fetchDuration.toFixed(
                0,
            )}ms, read in ${readCacheDuration.toFixed(0)}ms`,
        );

        return savedEntry.data;
    };

    // During development, for now it fetches data twice between the middleware and the handler.
    // TODO: find a way to share the cache between the two.

    // On Cloudflare Workers, we can't share promises between requests:
    // > Cannot perform I/O on behalf of a different request. I/O objects (such as streams, request/response bodies, and others)
    // > created in the context of one request handler cannot be accessed from a different request's handler.
    //
    // To avoid this limitation and still avoid concurrent requests, we use a WeakMap to store the pending requests.
    const contextPendings = new WeakMap<object, Map<string, Promise<any>>>();

    const cacheFn = async (...rawArgs: Args | [...Args, CacheFunctionOptions]) => {
        const [args, { signal }] = extractCacheFunctionOptions<Args>(rawArgs);

        const cacheArgs = options.extractArgs ? options.extractArgs(args) : args;
        const key = getCacheKey(cacheName, cacheArgs);

        return await trace(
            {
                name: key,
                operation: `cache.get`,
            },
            async (span) => {
                const context = await getGlobalContext();
                signal?.throwIfAborted();

                const pendings = contextPendings.get(context) ?? new Map<string, Promise<any>>();
                contextPendings.set(context, pendings);

                // If a pending request exists, wait for it
                if (pendings.has(key)) {
                    span.setAttribute('cacheStatus', 'pending');
                    return await pendings.get(key);
                }

                // Otherwise, fetch the value
                const promise = fetchValue(signal, span, key, ...args);
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

    cacheFn.revalidate = async (...rawArgs: Args | [...Args, CacheFunctionOptions]) => {
        const [args, { signal }] = extractCacheFunctionOptions<Args>(rawArgs);
        const cacheArgs = options.extractArgs ? options.extractArgs(args) : args;
        const key = getCacheKey(cacheName, cacheArgs);

        await revalidate(signal, key, ...args);
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
    return await trace(
        {
            operation: `cache.setCacheEntry`,
            name: key,
        },
        async () => {
            await Promise.all(cacheBackends.map((backend) => backend.set(key, entry)));
        },
    );
}

function now(): number {
    // Local Next.js development doesn't have performance.now()
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function isCacheFunctionOptions(arg: any): arg is CacheFunctionOptions {
    return (
        arg &&
        typeof arg === 'object' &&
        'signal' in arg &&
        (arg.signal instanceof AbortSignal || arg.signal === undefined) &&
        Object.keys(arg).length === 1
    );
}

function extractCacheFunctionOptions<Args extends any[]>(
    args: Args | [...Args, CacheFunctionOptions],
): [Args, CacheFunctionOptions] {
    const lastArg = args[args.length - 1];
    if (isCacheFunctionOptions(lastArg)) {
        return [args.slice(0, -1) as Args, lastArg];
    }

    // @ts-ignore
    return [args, { signal: undefined }];
}
