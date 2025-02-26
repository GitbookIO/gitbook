import hash from 'object-hash';

import { captureException } from '../../sentry';
import { race, singletonMap } from '../async';
import { type TraceSpan, trace } from '../tracing';
import { assertIsNotV2 } from '../v2';
import { waitUntil } from '../waitUntil';
import { cacheBackends } from './backends';
import { memoryCache } from './memory';
import type { CacheBackend, CacheEntry } from './types';

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

    /** Returns a precomputed hash that is used alongside arguments to generate the cache key */
    getKeySuffix?: () => Promise<string | undefined>;

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
    cacheDef: CacheDefinition<Args, Result>
): CacheFunction<Args, Result> {
    // We stop everything after 10s to avoid pending requests
    const timeout = cacheDef.timeout ?? 1000 * 10;
    const defaultTtl = cacheDef.defaultTtl ?? 60 * 60 * 24;

    const revalidate = singletonMap(
        async (key: string, signal: AbortSignal | undefined, ...args: Args) => {
            assertIsNotV2();
            return await trace(
                {
                    name: key,
                    operation: 'cache.revalidate',
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
                        await waitUntil(setCacheEntry(cacheEntry, cacheBackends));
                    }

                    return cacheEntry;
                }
            );
        }
    );

    const fetchValue = singletonMap(
        async (key: string, signal: AbortSignal | undefined, span: TraceSpan, ...args: Args) => {
            const timeStart = now();
            let readCacheDuration = 0;
            let _fetchDuration = 0;

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

                        if (!entry) {
                            return null;
                        }

                        // Detect empty cache entries to avoid returning them.
                        // Also log in Sentry to investigate what cache is returning empty entries.
                        if (
                            entry.data &&
                            typeof entry.data === 'object' &&
                            Object.keys(entry.data).length === 0
                        ) {
                            captureException(
                                new Error(
                                    `Cache entry ${key} from ${backendName} is an empty object`
                                )
                            );
                            return null;
                        }

                        return [entry, backend.name] as const;
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
                            _fetchDuration = now() - timeFetch;
                            return [upstream, 'fetch'] as const;
                        },

                        // If no entry is found in the cache backends, we fallback to the fetch
                        fallbackOnNull: true,
                    }
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
                    setCacheEntry(
                        savedEntry,
                        cacheBackends.filter(
                            (backend) =>
                                backend.name !== backendName && backend.replication === 'local'
                        )
                    )
                );
            }

            const _totalDuration = now() - timeStart;

            // Log
            if (process.env.SILENT !== 'true') {
            }

            if (savedEntry.meta.revalidatesAt && savedEntry.meta.revalidatesAt < Date.now()) {
                // Revalidate in the background
                await waitUntil(revalidate(key, undefined, ...args));
            }

            return savedEntry.data;
        }
    );

    // During development, for now it fetches data twice between the middleware and the handler.
    // TODO: find a way to share the cache between the two.
    const cacheFn = async (...rawArgs: Args | [...Args, CacheFunctionOptions]) => {
        assertIsNotV2();
        const [args, { signal }] = extractCacheFunctionOptions<Args>(rawArgs);

        const cacheArgs = cacheDef.getKeyArgs ? cacheDef.getKeyArgs(args) : args;
        const cacheKeySuffix = cacheDef.getKeySuffix ? await cacheDef.getKeySuffix() : undefined;
        const key = getCacheKey(cacheDef.name, cacheArgs, cacheKeySuffix);

        return await trace(
            {
                name: key,
                operation: 'cache.get',
            },
            async (span) => {
                signal?.throwIfAborted();
                return fetchValue(key, signal, span, ...args);
            }
        );
    };

    cacheFn.revalidate = async (...rawArgs: Args | [...Args, CacheFunctionOptions]) => {
        assertIsNotV2();
        const [args, { signal }] = extractCacheFunctionOptions<Args>(rawArgs);
        const cacheArgs = cacheDef.getKeyArgs ? cacheDef.getKeyArgs(args) : args;
        const cacheKeySuffix = cacheDef.getKeySuffix ? await cacheDef.getKeySuffix() : undefined;
        const key = getCacheKey(cacheDef.name, cacheArgs, cacheKeySuffix);

        const result = await revalidate(key, signal, ...args);
        return result.data;
    };

    cacheFn.hasInMemory = async (...args: Args) => {
        assertIsNotV2();
        const cacheArgs = cacheDef.getKeyArgs ? cacheDef.getKeyArgs(args) : args;
        const cacheKeySuffix = cacheDef.getKeySuffix ? await cacheDef.getKeySuffix() : undefined;
        const key = getCacheKey(cacheDef.name, cacheArgs, cacheKeySuffix);
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
export function getCacheKey(fnName: string, args: any[], suffix: string | undefined) {
    const hashedArgs = args.map((arg) => hashValue(arg));

    if (suffix) {
        hashedArgs.push(suffix);
    }
    let innerKey = hashedArgs.join(',');

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

async function setCacheEntry(entry: CacheEntry, backend: CacheBackend | CacheBackend[]) {
    return await trace(
        {
            operation: 'cache.setCacheEntry',
            name: entry.meta.key,
        },
        async () => {
            const backends = Array.isArray(backend) ? backend : [backend];
            await Promise.all(backends.map((backend) => backend.set(entry)));
        }
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
    args: Args | [...Args, CacheFunctionOptions]
): [Args, CacheFunctionOptions] {
    const lastArg = args[args.length - 1];
    if (isCacheFunctionOptions(lastArg)) {
        return [args.slice(0, -1) as Args, lastArg];
    }

    // @ts-ignore
    return [args, { signal: undefined }];
}
