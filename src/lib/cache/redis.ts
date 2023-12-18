import { Redis } from '@upstash/redis/cloudflare';

import { CacheBackend, CacheEntry, CacheEntryMeta } from './types';
import { filterOutNullable } from '../typescript';

const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: process.env.UPSTASH_REDIS_REST_URL,
              token: process.env.UPSTASH_REDIS_REST_TOKEN,
          })
        : null;

const cacheNamespace = process.env.UPSTASH_REDIS_NAMESPACE ?? 'gitbook';
const cacheVersion = 1;

export const redisCache: CacheBackend | null = redis
    ? {
          async get(key) {
              const redisEntry = (await redis.json.get(getRedisKey(key))) as CacheEntry | null;
              if (!redisEntry) {
                  return null;
              }

              return redisEntry;
          },

          async set(key, entry) {
              const multi = redis.multi();

              const redisKey = getRedisKey(key);
              const expire = Math.max(0, (entry.meta.expiresAt - Date.now()) / 1000);

              entry.meta.tags.forEach((tag) => {
                  const redisTagKey = getCacheTagKey(tag);

                  multi.sadd(redisTagKey, redisKey);

                  // Set am expiration on the tag to be the maximum of the expiration of all keys

                  // @ts-ignore - https://github.com/upstash/upstash-redis/issues/789
                  multi.expire(redisTagKey, expire, 'GT');
                  // @ts-ignore
                  multi.expire(redisTagKey, expire, 'NX');
              });

              // @ts-ignore
              multi.json.set(redisKey, '$', entry);
              multi.expire(redisKey, expire);

              await multi.exec();
          },

          async revalidateTags(tags) {
              const keys = (
                  await Promise.all(tags.map((tag) => redis.smembers(getCacheTagKey(tag))))
              ).flat();

              const pipeline = redis.pipeline();
              let metas: Array<CacheEntryMeta | null> = [];

              if (keys.length > 0) {
                  metas = (
                      await redis.json.mget(keys, '$.meta')
                  ).flat() as Array<CacheEntryMeta | null>;

                  // Finally, delete all keys
                  keys.forEach((key) => {
                      pipeline.del(key);
                  });
              }

              tags.forEach((tag) => {
                  pipeline.del(getCacheTagKey(tag));
              });

              await pipeline.exec();
              return metas.filter(filterOutNullable);
          },
      }
    : null;

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
