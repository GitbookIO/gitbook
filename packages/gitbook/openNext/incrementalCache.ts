import { createHash } from 'node:crypto';
import type {
    CacheEntryType,
    CacheValue,
    IncrementalCache,
    WithLastModified,
} from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import type { DurableObjectNamespace, Rpc } from '@cloudflare/workers-types';

export const BINDING_NAME = 'NEXT_INC_CACHE_R2_BUCKET';
export const DEFAULT_PREFIX = 'incremental-cache';

export type KeyOptions = {
    cacheType?: CacheEntryType;
};

/**
 *
 * It is very similar to the `R2IncrementalCache` in the `@opennextjs/cloudflare` package, but it allow us to trace
 * the cache operations. It also integrates both R2 and Cache API in a single class.
 * Having our own, will allow us to customize it in the future if needed.
 */
class GitbookIncrementalCache implements IncrementalCache {
    name = 'GitbookIncrementalCache';

    protected localCache: Cache | undefined;

    async get<CacheType extends CacheEntryType = 'cache'>(
        key: string,
        cacheType?: CacheType
    ): Promise<WithLastModified<CacheValue<CacheType>> | null> {
        const cacheKey = this.getR2Key(key, cacheType);

        const r2 = getCloudflareContext().env[BINDING_NAME];
        const localCache = await this.getCacheInstance();
        if (!r2) throw new Error('No R2 bucket');
        if (process.env.SHOULD_BYPASS_CACHE === 'true') {
            // We are in a local middleware environment, we should bypass the cache
            // and go directly to the server.
            return null;
        }
        try {
            // Check local cache first if available
            const localCacheEntry = await localCache.match(this.getCacheUrlKey(cacheKey));
            if (localCacheEntry) {
                const result = (await localCacheEntry.json()) as WithLastModified<
                    CacheValue<CacheType>
                >;
                return this.returnNullOn404({
                    ...result,
                    // Because we use tag cache and also invalidate them every time,
                    // if we get a cache hit, we don't need to check the tag cache as we already know it's not been revalidated
                    // this should improve performance even further, and reduce costs
                    shouldBypassTagCache: true,
                });
            }

            const r2Object = await r2.get(cacheKey);
            if (!r2Object) return null;

            return this.returnNullOn404({
                value: await r2Object.json(),
                lastModified: r2Object.uploaded.getTime(),
            });
        } catch (e) {
            console.error('Failed to get from cache', e);
            return null;
        }
    }

    //TODO: This is a workaround to handle 404 responses in the cache.
    // It should be handled by OpenNext cache interception directly. This should be removed once OpenNext cache interception is fixed.
    returnNullOn404<CacheType extends CacheEntryType = 'cache'>(
        cacheEntry: WithLastModified<CacheValue<CacheType>> | null
    ): WithLastModified<CacheValue<CacheType>> | null {
        if (!cacheEntry?.value) return null;
        if ('meta' in cacheEntry.value && cacheEntry.value.meta?.status === 404) {
            return null;
        }
        return cacheEntry;
    }

    async set<CacheType extends CacheEntryType = 'cache'>(
        key: string,
        value: CacheValue<CacheType>,
        cacheType?: CacheType
    ): Promise<void> {
        const cacheKey = this.getR2Key(key, cacheType);

        const localCache = await this.getCacheInstance();

        try {
            await this.writeToR2(cacheKey, JSON.stringify(value));

            //TODO: Check if there is any places where we don't have tags
            // Ideally we should always have tags, but in case we don't, we need to decide how to handle it
            // For now we default to a build ID tag, which allow us to invalidate the cache in case something is wrong in this deployment
            const tags = this.getTagsFromCacheEntry(value) ?? [
                `build_id/${process.env.NEXT_BUILD_ID}`,
            ];

            // We consider R2 as the source of truth, so we update the local cache
            // only after a successful R2 write
            await localCache.put(
                this.getCacheUrlKey(cacheKey),
                new Response(
                    JSON.stringify({
                        value,
                        // Note: `Date.now()` returns the time of the last IO rather than the actual time.
                        //       See https://developers.cloudflare.com/workers/reference/security-model/
                        lastModified: Date.now(),
                    }),
                    {
                        headers: {
                            // Cache-Control default to 30 minutes, will be overridden by `revalidate`
                            // In theory we should always get the `revalidate` value
                            'cache-control': `max-age=${value.revalidate ?? 60 * 30}`,
                            'cache-tag': tags.join(','),
                        },
                    }
                )
            );
        } catch (e) {
            console.error('Failed to set to cache', e);
        }
    }

    async delete(key: string): Promise<void> {
        const cacheKey = this.getR2Key(key);

        const r2 = getCloudflareContext().env[BINDING_NAME];
        const localCache = await this.getCacheInstance();
        if (!r2) throw new Error('No R2 bucket');

        try {
            await r2.delete(cacheKey);

            // Here again R2 is the source of truth, so we delete from local cache first
            await localCache.delete(this.getCacheUrlKey(cacheKey));
        } catch (e) {
            console.error('Failed to delete from cache', e);
        }
    }

    async writeToR2(key: string, value: string): Promise<void> {
        try {
            const env = getCloudflareContext().env as {
                WRITE_BUFFER: DurableObjectNamespace<
                    Rpc.DurableObjectBranded & {
                        write: (key: string, value: string) => Promise<void>;
                    }
                >;
            };
            const id = env.WRITE_BUFFER.idFromName(key);

            // A stub is a client used to invoke methods on the Durable Object
            const stub = env.WRITE_BUFFER.get(id);

            await stub.write(key, value);
        } catch {
            // We fallback to writing directly to R2
            // it can fail locally because the limit is 1Mb per args
            // It is 32Mb in production, so we should be fine
            const r2 = getCloudflareContext().env[BINDING_NAME];
            r2?.put(key, value);
        }
    }

    async getCacheInstance(): Promise<Cache> {
        if (this.localCache) return this.localCache;
        this.localCache = await caches.open('incremental-cache');
        return this.localCache;
    }

    // Utility function to generate keys for R2/Cache API
    getR2Key(initialKey: string, cacheType: CacheEntryType = 'cache'): string {
        let key = initialKey;
        if (cacheType === 'composable') {
            // For composable cache, we need to discard the build ID from the key
            const [_buildId, ...restOfTheKey] = JSON.parse(initialKey);
            key = JSON.stringify([...restOfTheKey]);
        }

        const hash = createHash('sha256').update(key).digest('hex');
        return `${DEFAULT_PREFIX}/${cacheType === 'cache' ? process.env?.NEXT_BUILD_ID : 'dataCache'}/${hash}.${cacheType}`.replace(
            /\/+/g,
            '/'
        );
    }

    getCacheUrlKey(cacheKey: string): string {
        return `http://cache.local/${cacheKey}`;
    }

    getTagsFromCacheEntry<CacheType extends CacheEntryType>(
        entry: CacheValue<CacheType>
    ): string[] | undefined {
        if ('tags' in entry && entry.tags) {
            return entry.tags;
        }

        if ('meta' in entry && entry.meta && 'headers' in entry.meta && entry.meta.headers) {
            const rawTags = entry.meta.headers['x-next-cache-tags'];
            if (typeof rawTags === 'string') {
                return rawTags.split(',');
            }
        }
        if ('value' in entry) {
            return entry.tags;
        }
    }
}

export default new GitbookIncrementalCache();
