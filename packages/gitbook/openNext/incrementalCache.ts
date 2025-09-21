import { createHash } from 'node:crypto';
import type {
    CacheEntryType,
    CacheValue,
    IncrementalCache,
    WithLastModified,
} from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';

import type { DurableObjectNamespace, Rpc } from '@cloudflare/workers-types';

export const BINDING_NAME = 'NEXT_INC_CACHE_R2_BUCKET';
export const DEFAULT_PREFIX = 'incremental-cache';

export type KeyOptions = {
    cacheType?: CacheEntryType;
};

/**
 *
 * It is very similar to the `R2IncrementalCache` in the `@opennextjs/cloudflare` package, but it has an additional
 * R2WriteBuffer Durable Object to handle writes to R2. Given how we set up cache, we often end up writing to the same key too fast.
 */
class GitbookIncrementalCache implements IncrementalCache {
    name = 'GitbookIncrementalCache';

    async get<CacheType extends CacheEntryType = 'cache'>(
        key: string,
        cacheType?: CacheType
    ): Promise<WithLastModified<CacheValue<CacheType>> | null> {
        const cacheKey = this.getR2Key(key, cacheType);

        const r2 = getCloudflareContext().env[BINDING_NAME];
        if (!r2) throw new Error('No R2 bucket');
        if (process.env.SHOULD_BYPASS_CACHE === 'true') {
            // We are in a local middleware environment, we should bypass the cache
            // and go directly to the server.
            return null;
        }
        try {
            const r2Object = await r2.get(cacheKey);
            if (!r2Object) return null;

            const json = (await r2Object.json()) as CacheValue<CacheType>;
            const lastModified = r2Object.uploaded.getTime();

            if (!json) return null;

            return this.returnNullOn404({
                value: json,
                lastModified,
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

        try {
            await this.writeToR2(cacheKey, JSON.stringify(value));
        } catch (e) {
            console.error('Failed to set to cache', e);
        }
    }

    async delete(key: string): Promise<void> {
        const cacheKey = this.getR2Key(key);

        const r2 = getCloudflareContext().env[BINDING_NAME];
        if (!r2) throw new Error('No R2 bucket');

        try {
            await r2.delete(cacheKey);
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
}

export default withRegionalCache(new GitbookIncrementalCache(), {
    mode: 'long-lived',
    // We can do it because we use our own logic to invalidate the cache
    bypassTagCacheOnCacheHit: true,
    defaultLongLivedTtlSec: 60 * 60 * 24 /* 24 hours */,
    // We don't want to update the cache entry on every cache hit
    shouldLazilyUpdateOnCacheHit: false,
});
