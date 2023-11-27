import { Redis } from '@upstash/redis';

const cacheNamespace = process.env.UPSTASH_REDIS_NAMESPACE ?? 'gitbook';

const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: process.env.UPSTASH_REDIS_REST_URL,
              token: process.env.UPSTASH_REDIS_REST_TOKEN,
          })
        : null;

const ttl = 60 * 60 * 24;
const memoryCache = new Map<string, any>();

/**
 * Cache data from an async function.
 * We don't use the next.js cache because it has a 2MB limit.
 */
export function cache<Args extends any[], Result>(
    fnName: string,
    fn: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
    return async (...args: Args) => {
        const key = getCacheKey(fnName, args);

        const cachedValue = await getCacheValue(key);
        if (cachedValue !== null) {
            return cachedValue;
        }

        const result = await fn(...args);

        await setCacheValue(key, result);

        return result;
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
async function setCacheValue(key: string, value: any) {
    memoryCache.set(key, value);

    if (redis) {
        await redis.set(key, value, {
            ex: ttl,
        });
    }
}
