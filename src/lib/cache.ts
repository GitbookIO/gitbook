import { Redis } from '@upstash/redis/cloudflare';
import parseCacheControl from 'parse-cache-control';

const cacheNamespace = process.env.UPSTASH_REDIS_NAMESPACE ?? 'gitbook';

const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: process.env.UPSTASH_REDIS_REST_URL,
              token: process.env.UPSTASH_REDIS_REST_TOKEN,
          })
        : null;

const memoryCache = new Map<
    string,
    {
        data: any;
        tags: string[];
        expiresAt: number;
    }
>();

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
 * Options to pass to the `fetch` call to disable the Next data-cache when wrapped in `cache()`.
 */
export const noCacheFetchOptions: Partial<RequestInit> = {
    // Cloudflare doesn't support the `cache` directive before next-on-pages patches the fetch function
    // https://github.com/cloudflare/workerd/issues/698
    // cache: 'no-store',
    next: { revalidate: 0 },
};

/**
 * Cache data from an async function.
 * We don't use the next.js cache because it has a 2MB limit.
 */
export function cache<Args extends any[], Result>(
    fnName: string,
    fn: (...args: Args) => Promise<CacheResult<Result>>,
    options: {
        /** Filter the arguments that should be taken into consideration for cachine */
        extractArgs?: (args: Args) => any[];
    } = {},
): (...args: Args) => Promise<Result> {
    const fetchValue = async (key: string, ...args: Args) => {
        // Read the cache
        const startTime = now();
        const cachedValue = await getCacheValue(key);
        const readCacheDuration = now() - startTime;

        // Returns it if it exists
        if (cachedValue !== null) {
            console.log(`cache: ${key} hit in ${readCacheDuration.toFixed(0)}ms`);
            return cachedValue;
        }

        // Fetch upstream
        const result = await fn(...args);
        const fetchDuration = now() - startTime - readCacheDuration;

        // Write it to the cache
        // As soon as it'll be possible with next-on-pages, we should `waitUntil`
        // to delay writing the cache after the response has been sent to the client.
        await setCacheValue(key, result);
        const writeCacheDuration = now() - startTime - readCacheDuration - fetchDuration;

        console.log(
            `cache: ${key} miss in ${fetchDuration.toFixed(
                0,
            )}ms, read in ${readCacheDuration.toFixed(0)}ms, write in ${writeCacheDuration.toFixed(
                0,
            )}ms`,
        );

        return result.data;
    };

    const pendings = new Map<string, Promise<any>>();

    return async (...args: Args) => {
        const cacheArgs = options.extractArgs ? options.extractArgs(args) : args;
        const key = getCacheKey(fnName, cacheArgs);

        // If a pending request exists, wait for it
        if (pendings.has(key)) {
            return await pendings.get(key);
        }

        // Otherwise, fetch the value
        const promise = fetchValue(key, ...args);
        pendings.set(key, promise);

        // Remove the pending request once it's done
        promise.finally(() => pendings.delete(key));

        return await promise;
    };
}

/**
 * Parse an HTTP response into a cache entry.
 */
export function parseCacheResponse<Result, DefaultData = Result>(
    response: Response,
): {
    ttl: number;
    tags: string[];
} {
    const cacheControlHeader = response.headers.get('cache-control');
    const cacheControl = cacheControlHeader ? parseCacheControl(cacheControlHeader) : null;
    const cacheTagHeader =
        response.headers.get('x-gitbook-cache-tag') ?? response.headers.get('cache-tag');

    const entry = {
        ttl: 60 * 60 * 24,
        tags: cacheTagHeader ? cacheTagHeader.split(',').map((tag) => tag.trim()) : [],
    };

    if (cacheControl && cacheControl['max-age']) {
        entry.ttl = cacheControl['max-age'];
    }

    return entry;
}

/**
 * Cache an HTTP response.
 */
export function cacheResponse<Result, DefaultData = Result>(
    response: Response & { data: Result },
    defaultEntry: Partial<CacheResult<DefaultData>> = {},
): CacheResult<DefaultData extends Result ? Result : DefaultData> {
    const parsed = parseCacheResponse(response);

    return {
        ttl: defaultEntry.ttl ?? parsed.ttl,
        tags: [...(defaultEntry.tags ?? []), ...parsed.tags],
        // @ts-ignore
        data: defaultEntry.data ?? response.data,
    };
}

/**
 * Invalidate all cache entries associated with the given tags.
 */
export async function invalidateCacheTags(tags: string[]) {
    // Clear from memory cache
    memoryCache.forEach((value, key) => {
        if (value.tags.some((t) => tags.includes(t))) {
            memoryCache.delete(key);
        }
    });

    // Clear from Redis
    if (redis) {
        const keys = (
            await Promise.all(tags.map((tag) => redis.smembers(getCacheTagKey(tag))))
        ).flat();
        const pipeline = redis.pipeline();

        keys.forEach((key) => {
            pipeline.del(key);
        });

        tags.forEach((tag) => {
            pipeline.del(getCacheTagKey(tag));
        });

        await pipeline.exec();
    }
}

/**
 * Create a cache key from a function name and its arguments.
 */
function getCacheKey(fnName: string, args: any[]) {
    return `${cacheNamespace}.${fnName}(${args.map((arg) => JSON.stringify(arg)).join(',')})`;
}

/**
 * Get the key for a tag.
 */
function getCacheTagKey(tag: string) {
    return `${cacheNamespace}.tags.${tag}`;
}

/**
 * Get a value from the cache.
 */
async function getCacheValue(key: string): Promise<any | null> {
    const memoryEntry = memoryCache.get(key);
    if (memoryEntry) {
        if (memoryEntry.expiresAt > Date.now()) {
            return memoryEntry.data;
        }

        return null;
    }

    if (redis) {
        const value = await redis.get(key);

        // Store in memory cache at least for the current execution
        if (value !== null) {
            memoryCache.set(key, {
                data: value,
                tags: [],
                expiresAt: Date.now() + 2 * 60,
            });
        }

        return value;
    }

    return null;
}

/**
 * Set a value in the cache.
 */
async function setCacheValue(key: string, entry: CacheResult<any>) {
    const ttl = entry.ttl ?? 60 * 60 * 24;

    memoryCache.set(key, {
        data: entry.data,
        tags: entry.tags ?? [],
        expiresAt: Date.now() + ttl * 1000,
    });

    if (redis) {
        const multi = redis.multi();

        entry.tags?.forEach((tag) => {
            multi.sadd(getCacheTagKey(tag), key);
        });

        multi.set(key, entry.data, {
            ex: ttl,
        });

        await multi.exec();
    }
}

function now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
