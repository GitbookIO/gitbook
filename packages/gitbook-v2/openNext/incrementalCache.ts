import { createHash } from 'node:crypto';

import type {
    CacheEntryType,
    CacheValue,
    IncrementalCache,
    WithLastModified,
} from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const BINDING_NAME = 'NEXT_INC_CACHE_R2_BUCKET';
export const PREFIX_ENV_NAME = 'NEXT_INC_CACHE_R2_PREFIX';
export const FALLBACK_BUILD_ID = 'no-build-id';
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
        if (!r2) throw new Error('No R2 bucket');
        try {
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
        if (!r2) throw new Error('No R2 bucket');

        try {
            await r2.put(this.getR2Key(key, cacheType), JSON.stringify(value));
        } catch (e) {
            console.error('Failed to set to cache', e);
        }
    }

    async delete(key: string): Promise<void> {
        const r2 = getCloudflareContext().env[BINDING_NAME];
        if (!r2) throw new Error('No R2 bucket');

        try {
            await r2.delete(this.getR2Key(key));
        } catch (e) {
            console.error('Failed to delete from cache', e);
        }
    }

    // Utility function to generate keys for R2/Cache API

    getR2Key(key: string, cacheType?: CacheEntryType): string {
        const hash = createHash('sha256').update(key).digest('hex');
        return `${DEFAULT_PREFIX}/${cacheType === 'cache' ? process.env?.NEXT_BUILD_ID : 'dataCache'}/${hash}.${cacheType}`.replace(
            /\/+/g,
            '/'
        );
    }
}

export default new GitbookIncrementalCache();
