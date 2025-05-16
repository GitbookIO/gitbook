import { createHash } from 'node:crypto';

import type {
    CacheEntryType,
    CacheValue,
    IncrementalCache,
    WithLastModified,
} from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const BINDING_NAME = 'NEXT_INC_CACHE_R2_BUCKET';
export const DEFAULT_PREFIX = 'incremental-cache';

export type KeyOptions = {
    cacheType?: CacheEntryType;
};

class GitbookIncrementalCache implements IncrementalCache {
    name = 'GitbookIncrementalCache';

    protected localCache: Cache | undefined;

    async get<CacheType extends CacheEntryType = 'cache'>(
        key: string,
        cacheType?: CacheType
    ): Promise<WithLastModified<CacheValue<CacheType>> | null> {
        const r2 = getCloudflareContext().env[BINDING_NAME];
        const localCache = await this.getCacheInstance();
        if (!r2) throw new Error('No R2 bucket');
        try {
            const cacheKey = this.getR2Key(key, cacheType);
            // Check local cache first if available
            const localCacheEntry = await localCache.match(this.getCacheUrlKey(cacheKey));
            if (localCacheEntry) {
                return localCacheEntry.json();
            }

            const r2Object = await r2.get(this.getR2Key(key, cacheType));
            if (!r2Object) return null;

            return {
                value: await r2Object.json(),
                lastModified: r2Object.uploaded.getTime(),
            };
        } catch (e) {
            console.error('Failed to get from cache', e);
            return null;
        }
    }

    async set<CacheType extends CacheEntryType = 'cache'>(
        key: string,
        value: CacheValue<CacheType>,
        cacheType?: CacheType
    ): Promise<void> {
        const r2 = getCloudflareContext().env[BINDING_NAME];
        const localCache = await this.getCacheInstance();
        if (!r2) throw new Error('No R2 bucket');

        try {
            const cacheKey = this.getR2Key(key, cacheType);
            await r2.put(cacheKey, JSON.stringify(value));

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
        const r2 = getCloudflareContext().env[BINDING_NAME];
        const localCache = await this.getCacheInstance();
        if (!r2) throw new Error('No R2 bucket');

        try {
            const cacheKey = this.getR2Key(key);

            await r2.delete(cacheKey);

            // Here again R2 is the source of truth, so we delete from local cache first
            await localCache.delete(this.getCacheUrlKey(cacheKey));
        } catch (e) {
            console.error('Failed to delete from cache', e);
        }
    }

    async getCacheInstance(): Promise<Cache> {
        if (this.localCache) return this.localCache;
        this.localCache = await caches.open('incremental-cache');
        return this.localCache;
    }

    // Utility function to generate keys for R2/Cache API
    getR2Key(key: string, cacheType?: CacheEntryType): string {
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
