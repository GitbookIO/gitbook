import hash from 'object-hash';

import { cacheBackends } from './backends';
import { memoryCache } from './memory';
import { CacheEntry } from './types';
import { race, singletonMap } from '../async';
import { TraceSpan, trace } from '../tracing';
import { waitUntil } from '../waitUntil';

export type CacheFunctionOptions = {
    signal: AbortSignal | undefined;
};

export type CacheFunction<Args extends any[], Result> = ((
    ...args: Args | [...Args, CacheFunctionOptions]
) => Promise<Result>) & {
    /**
     * Refetch the data and update the cache.
     */
    revalidate: (...args: Args | [...Args, CacheFunctionOptions]) => Promise<Result>;

    /**
     * Check if a value is in the memory cache.
     */
    hasInMemory: (...args: Args) => Promise<boolean>;
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
     * Time before ttl where the cache should be revalidated (in seconds).
     */
    revalidateBefore?: number;
}

export interface CacheDefinition<Args extends any[], Result> {
    /** Unique name for the cache */
    name: string;

    /** Tag to associate to the entry */
    tag?: (...args: Args) => string;

    /** Filter the arguments that should be taken into consideration for the cache key */
    getKeyArgs?: (args: Args) => any[];

    /** Default ttl (in seconds) */
    defaultTtl?: number;

    /** When a request to the underlying resource will timeout. */
    timeout?: number;

    /** Function to get the value */
    get: (...args: [...Args, CacheFunctionOptions]) => Promise<CacheResult<Result>>;
}

/**
 * Cache data from an async function.
 * We don't use the next.js cache because it has a 2MB limit.
 */
export function cache<Args extends any[], Result>(
    cacheDef: CacheDefinition<Args, Result>,
): CacheFunction<Args, Result> {
    // We stop everything after 10s to avoid pending requests
    const timeout = cacheDef.timeout ?? 1000 * 10;
    const defaultTtl = cacheDef.defaultTtl ?? 60 * 60 * 24;

    const revalidate = singletonMap(
        async (key: string, signal: AbortSignal | undefined, ...args: Args) => {
            return await trace(
                {
                    name: key,
                    operation: `cache.revalidate`,
                },
                async (span) => {
                    // Fetch upstream
                    const result = await cacheDef.get(...args, { signal });
                    signal?.throwIfAborted();

                    const setAt = Date.now();
                    const expiresAt = setAt + (result.ttl ?? defaultTtl) * 1000;

                    const cacheEntry: CacheEntry = {
                        data: result.data,
                        meta: {
                            key,
                            cache: cacheDef.name,
                            tag: cacheDef.tag?.(...args),
                            setAt,
                            expiresAt,
                            revalidatesAt: result.revalidateBefore
                                ? expiresAt - result.revalidateBefore * 1000
                                : undefined,
                            args,
                        },
                    };

                    span.setAttribute('cacheTtl', result.ttl ?? 0);

                    // Write it to the cache
                    if (result.ttl && result.ttl > 0) {
                        await waitUntil(setCacheEntry(cacheEntry));
                    }

                    return cacheEntry;
                },
            );
        },
    );

    const fetchValue = singletonMap(
        async (key: string, signal: AbortSignal | undefined, span: TraceSpan, ...args: Args) => {
            const timeStart = now();
            let readCacheDuration = 0;
            let fetchDuration = 0;

            let result: readonly [CacheEntry, string] | null = null;
            const tag = cacheDef.tag?.(...args);

            // Try the memory backend, independently of the other backends as it doesn't have a network cost
            const memoryEntry = await memoryCache.get({ key, tag });
            if (memoryEntry) {
                span.setAttribute('memory', true);
                result = [memoryEntry, 'memory'] as const;
            } else {
                result = await race(
                    cacheBackends,
                    async (backend, { signal }) => {
                        const entry = await backend.get({ key, tag }, { signal });
                        return entry ? ([entry, backend.name] as const) : null;
                    },
                    {
                        signal,
                        timeout,

                        // We give 70ms to the caches to respond, otherwise we start fallbacking to the actual fetch
                        // It should represents a bit more than the 90th percentile of the KV cache response time
                        blockTimeout: 70,

                        blockFallback: async (fallbackOps) => {
                            const timeFetch = now();
                            const upstream = await revalidate(key, fallbackOps.signal, ...args);

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

            const fromBackend = cacheBackends.find((backend) => backend.name === backendName);
            // If the resolution came from a global cache, we update the local caches.
            // If the resolution came from a fetch (fromBackend is undefined), we don't need to update caches as it was
            // done in the revalidate function above.
            if (fromBackend?.replication === 'global') {
                await waitUntil(
                    Promise.all(
                        cacheBackends
                            .filter(
                                (backend) =>
                                    backend.name !== backendName && backend.replication === 'local',
                            )
                            .map((backend) => backend.set(savedEntry)),
                    ),
                );
            }

            const totalDuration = now() - timeStart;

            // Log
            if (process.env.SILENT !== 'true') {
                console.log(
                    `cache: ${key} ${cacheStatus}${
                        cacheStatus === 'hit' ? ` on ${backendName}` : ''
                    } in total ${totalDuration.toFixed(0)}ms, fetch in ${fetchDuration.toFixed(
                        0,
                    )}ms, read in ${readCacheDuration.toFixed(0)}ms`,
                );
            }

            if (savedEntry.meta.revalidatesAt && savedEntry.meta.revalidatesAt < Date.now()) {
                // Revalidate in the background
                await waitUntil(revalidate(key, undefined, ...args));
            }

            return savedEntry.data;
        },
    );

    // During development, for now it fetches data twice between the middleware and the handler.
    // TODO: find a way to share the cache between the two.
    const cacheFn = async (...rawArgs: Args | [...Args, CacheFunctionOptions]) => {
        const [args, { signal }] = extractCacheFunctionOptions<Args>(rawArgs);

        const cacheArgs = cacheDef.getKeyArgs ? cacheDef.getKeyArgs(args) : args;
        const key = getCacheKey(cacheDef.name, cacheArgs);

        return await trace(
            {
                name: key,
                operation: `cache.get`,
            },
            async (span) => {
                signal?.throwIfAborted();
                return fetchValue(key, signal, span, ...args);
            },
        );
    };

    cacheFn.revalidate = async (...rawArgs: Args | [...Args, CacheFunctionOptions]) => {
        const [args, { signal }] = extractCacheFunctionOptions<Args>(rawArgs);
        const cacheArgs = cacheDef.getKeyArgs ? cacheDef.getKeyArgs(args) : args;
        const key = getCacheKey(cacheDef.name, cacheArgs);

        const result = await revalidate(key, signal, ...args);
        return result.data;
    };

    cacheFn.hasInMemory = async (...args: Args) => {
        const cacheArgs = cacheDef.getKeyArgs ? cacheDef.getKeyArgs(args) : args;
        const key = getCacheKey(cacheDef.name, cacheArgs);
        const tag = cacheDef.tag?.(...args);

        const memoryEntry = await memoryCache.get({ key, tag });
        if (memoryEntry) {
            return true;
        }

        return fetchValue.isRunning(key);
    };

    // @ts-ignore
    registeredCaches.set(cacheDef.name, cacheFn);

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
    let innerKey = args.map((arg) => hashValue(arg)).join(',');

    // Avoid crazy long keys, by fallbacking to a hash
    if (innerKey.length > 400) {
        innerKey = hash(args);
    }

    return `${fnName}(${innerKey})`;
}

function hashValue(arg: any): string {
    if (arg === undefined) {
        return '';
    }

    if (typeof arg === 'object' && !!arg) {
        return hash(arg);
    }

    return JSON.stringify(arg);
}

async function setCacheEntry(entry: CacheEntry) {
    return await trace(
        {
            operation: `cache.setCacheEntry`,
            name: entry.meta.key,
        },
        async () => {
            await Promise.all(cacheBackends.map((backend) => backend.set(entry)));
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
