import { Redis } from '@upstash/redis/cloudflare';

import { CacheBackend, CacheEntryMeta } from './types';
import { getCacheMaxAge } from './utils';
import { trace } from '../tracing';
import { filterOutNullable } from '../typescript';

const cacheNamespace = process.env.UPSTASH_REDIS_NAMESPACE ?? 'gitbook';
const cacheVersion = 2;

export const redisCache: CacheBackend = {
    name: 'redis',
    replication: 'global',
    async get(key, options) {
        const redis = getRedis(options?.signal);
        if (!redis) {
            return null;
        }
        return trace(`redis.get(${key})`, async (span) => {
            const valueKey = getCacheEntryKey(key, 'value');
            const redisEntry = await redis.get<string>(valueKey);

            span.setAttribute('hit', !!redisEntry);

            if (!redisEntry) {
                return null;
            }

            return JSON.parse(redisEntry);
        });
    },

    async set(key, entry) {
        const redis = getRedis();
        if (!redis) {
            return;
        }

        return trace(`redis.set(${key})`, async () => {
            const expire = getCacheMaxAge(entry.meta);

            // Don't cache for less than 10min, as it's not worth it
            if (expire <= 10 * 60) {
                return;
            }

            const multi = redis.multi();
            const valueKey = getCacheEntryKey(key, 'value');
            const metaKey = getCacheEntryKey(key, 'meta');

            entry.meta.tags.forEach((tag) => {
                const redisTagKey = getCacheTagKey(tag);

                multi.sadd(redisTagKey, key);

                // Set am expiration on the tag to be the maximum of the expiration of all keys
                multi.expire(redisTagKey, expire, 'GT');
                multi.expire(redisTagKey, expire, 'NX');
            });

            multi.set(valueKey, JSON.stringify(entry));
            multi.set(metaKey, JSON.stringify(entry.meta));
            multi.expire(valueKey, expire);
            multi.expire(metaKey, expire);

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
            multi.del(getCacheEntryKey(key, 'value'));
            multi.del(getCacheEntryKey(key, 'meta'));
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
            // Read the meta
            if (!purge) {
                metas = (
                    await redis.mget<Array<string | null>>(
                        // Hard limit to avoid fetching a massive list of data
                        // Starts with the smallest keys.
                        Array.from(keys)
                            .sort((a, b) => a.length - b.length)
                            .slice(0, 50)
                            .map((key) => getCacheEntryKey(key, 'meta')),
                    )
                )
                    .flat()
                    .map((rawMeta) => {
                        if (!rawMeta) {
                            return null;
                        }
                        return JSON.parse(rawMeta);
                    })
                    .filter(filterOutNullable);
            }

            // Delete all keys
            keys.forEach((key) => {
                pipeline.del(getCacheEntryKey(key, 'value'));
            });
        }

        // And delete the tags
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
 * Get the key for an entry.
 */
function getCacheEntryKey(key: string, type: 'meta' | 'value') {
    return getRedisKey(`entry.${key}.${type}`);
}

/**
 * Create a redis key for a cache entry.
 */
function getRedisKey(key: string) {
    return `${cacheNamespace}.${cacheVersion}.${key}`;
}
