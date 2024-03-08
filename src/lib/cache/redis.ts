import { Redis } from '@upstash/redis/cloudflare';

import { CacheBackend, CacheEntry, CacheEntryMeta } from './types';
import { getCacheMaxAge } from './utils';
import { trace } from '../tracing';
import { filterOutNullable } from '../typescript';
import { waitUntil } from '../waitUntil';

const cacheNamespace = process.env.UPSTASH_REDIS_NAMESPACE ?? 'gitbook';
const cacheVersion = 1;

export const redisCache: CacheBackend = {
    name: 'redis',
    replication: 'global',
    async get(key, options) {
        const redis = getRedis(options?.signal);
        if (!redis) {
            return null;
        }
        return trace(`redis.get(${key})`, async (trace) => {
            const redisKey = getRedisKey(key);
            const redisEntry = await redis.json.get(redisKey);

            trace.setAttribute('hit', !!redisEntry);

            if (!redisEntry) {
                return null;
            }

            await waitUntil(
                redis.json.numincrby(redisKey, '$.meta.hits', 1).catch((error) => {
                    // Ignore errors
                }),
            );

            return redisEntry as CacheEntry;
        });
    },

    async set(key, entry) {
        const redis = getRedis();
        if (!redis) {
            return;
        }

        return trace(`redis.set(${key})`, async (trace) => {
            const multi = redis.multi();

            const redisKey = getRedisKey(key);
            const expire = getCacheMaxAge(entry.meta);

            // Don't cache for less than 1min, as it's not worth it
            if (expire <= 10 * 60) {
                return;
            }

            entry.meta.tags.forEach((tag) => {
                const redisTagKey = getCacheTagKey(tag);

                multi.sadd(redisTagKey, redisKey);

                // Set am expiration on the tag to be the maximum of the expiration of all keys
                multi.expire(redisTagKey, expire, 'GT');
                multi.expire(redisTagKey, expire, 'NX');
            });

            // @ts-ignore
            multi.json.set(redisKey, '$', entry);
            multi.expire(redisKey, expire);

            await multi.exec();
        });
    },

    async del(keys) {
        const redis = getRedis();
        if (!redis) {
            return;
        }

        const multi = redis.multi();
        keys.forEach((key) => {
            multi.del(getRedisKey(key));
        });

        await multi.exec();
    },

    async revalidateTags(tags, purge) {
        const redis = getRedis();
        if (!redis) {
            return { keys: [], metas: [] };
        }

        const keys = new Set(
            (await Promise.all(tags.map((tag) => redis.smembers(getCacheTagKey(tag))))).flat(),
        );

        const pipeline = redis.pipeline();
        let metas: Array<CacheEntryMeta | null> = [];

        if (keys.size > 0) {
            if (!purge) {
                metas = (
                    await redis.json.mget(
                        // Hard limit to avoid fetching a massive list of data
                        // Starts with the smallest keys.
                        Array.from(keys)
                            .sort((a, b) => a.length - b.length)
                            .slice(0, 10),
                        '$.meta',
                    )
                ).flat() as Array<CacheEntryMeta | null>;
            }

            // Finally, delete all keys
            keys.forEach((key) => {
                pipeline.del(key);
            });
        }

        tags.forEach((tag) => {
            pipeline.del(getCacheTagKey(tag));
        });

        await pipeline.exec();
        return { keys: Array.from(keys), metas: metas.filter(filterOutNullable) };
    },
};

/**
 * Get the redis client.
 */
export function getRedis(signal?: AbortSignal) {
    return process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: process.env.UPSTASH_REDIS_REST_URL,
              token: process.env.UPSTASH_REDIS_REST_TOKEN,
              signal,
          })
        : null;
}

/**
 * Get the key for a tag.
 */
function getCacheTagKey(tag: string) {
    return getRedisKey(`tags.${tag}`);
}

/**
 * Create a redis key for a cache entry.
 */
function getRedisKey(key: string) {
    return `${cacheNamespace}.${cacheVersion}.${key}`;
}
