import { Redis } from '@upstash/redis';
import parseCacheControl from 'parse-cache-control';

const cacheNamespace = process.env.UPSTASH_REDIS_NAMESPACE ?? 'gitbook';

const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: process.env.UPSTASH_REDIS_REST_URL,
              token: process.env.UPSTASH_REDIS_REST_TOKEN,
          })
        : null;

const memoryCache = new Map<string, any>();

export interface CacheResult<Result> {
    data: Result;

    /**
     * Time to live in seconds.
     * @default 60 * 60 * 24
     */
    ttl?: number;
}

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

        const { data, ttl = 60 * 60 * 24 } = await fn(...args);

        await setCacheValue(key, data, ttl);

        return data;
    };
}

/**
 * Cache an HTTP response.
 */
export function cacheResponse<Result>(
    response: Response & { data: Result },
    /**
     * Default time to live in seconds, when the response has no cache header.
     */
    defaultTtl: number = 60 * 60 * 24,
): CacheResult<Result> {
    const cacheControlHeader = response.headers.get('cache-control');
    const cacheControl = cacheControlHeader ? parseCacheControl(cacheControlHeader) : null;

    let ttl = defaultTtl;
    if (cacheControl && cacheControl['max-age']) {
        ttl = cacheControl['max-age'];
    }

    return {
        data: response.data,
    };
}

/**
 * Create a cache key from a function name and its arguments.
 */
function getCacheKey(fnName: string, args: any[]) {
    return `${cacheNamespace}.${fnName}(${args.map((arg) => JSON.stringify(arg)).join(',')})`;
}

/**
 * Get a value from the cache.
 */
async function getCacheValue(key: string) {
    if (memoryCache.has(key)) {
        return memoryCache.get(key);
    }

    if (redis) {
        const value = await redis.get(key);
        return value;
    }

    return null;
}

/**
 * Set a value in the cache.
 */
async function setCacheValue(key: string, value: any, ttl: number) {
    memoryCache.set(key, value);

    if (redis) {
        await redis.set(key, value, {
            ex: ttl,
        });
    }
}
