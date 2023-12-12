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
    return async (...args: Args) => {
        const cacheArgs = options.extractArgs ? options.extractArgs(args) : args;
        const key = getCacheKey(fnName, cacheArgs);

        const cachedValue = await getCacheValue(key);
        if (cachedValue !== null) {
            return cachedValue;
        }

        const result = await fn(...args);
        await setCacheValue(key, result);

        return result.data;
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
