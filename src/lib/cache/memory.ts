import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

import { CacheBackend, CacheEntry } from './types';
import { NON_IMMUTABLE_LOCAL_CACHE_MAX_AGE_SECONDS, isCacheEntryImmutable } from './utils';

export const memoryCache: CacheBackend = {
    name: 'memory',
    replication: 'local',
    async get(key) {
        const memoryCache = getMemoryCache();
        const memoryEntry = memoryCache.get(key);

        if (!memoryEntry) {
            return null;
        }

        if (memoryEntry.meta.expiresAt > Date.now()) {
            return memoryEntry;
        } else {
            memoryCache.delete(key);
        }

        return null;
    },
    async set(key, entry) {
        const memoryCache = getMemoryCache();
        // When the entry is immutable, we can cache it for the entire duration.
        // Else we cache it for a very short time.
        const expiresAt =
            isCacheEntryImmutable(entry.meta) || process.env.NODE_ENV === 'development'
                ? null
                : Math.min(
                      Date.now() + NON_IMMUTABLE_LOCAL_CACHE_MAX_AGE_SECONDS * 1000,
                      entry.meta.expiresAt,
                  );

        const meta = { ...entry.meta };

        if (expiresAt) {
            meta.expiresAt = expiresAt;
        }

        memoryCache.set(key, { ...entry, meta });
    },
    async del(keys) {
        const memoryCache = getMemoryCache();
        keys.forEach((key) => memoryCache.delete(key));
    },
    async revalidateTags(tags) {
        const memoryCache = getMemoryCache();
        const keys: string[] = [];

        memoryCache.forEach((entry, key) => {
            if (tags.some((tag) => entry.meta.tags.includes(tag))) {
                keys.push(key);
                memoryCache.delete(key);
            }
        });

        return {
            keys,
            metas: [],
        };
    },
};

/**
 * With next-on-pages, the code seems to be isolated between the middleware and the handler.
 * To share the cache between the two, we use a global variable.
 */
function getMemoryCache(): Map<string, CacheEntry> {
    // We lazy-load the next-on-pages package to avoid errors when running tests because of 'server-only'.
    // const { getOptionalRequestContext } = await import('@cloudflare/next-on-pages');

    let globalThisForMemoryCache: any = globalThis;
    const cloudflare = getOptionalRequestContext();
    if (cloudflare) {
        globalThisForMemoryCache = cloudflare.ctx;
    }
    // console.log('getOptionalRequestContext', cloudflare);
    // @ts-ignore
    if (!globalThisForMemoryCache.gitbookMemoryCache) {
        console.log('Creating memory cache')
        // @ts-ignore
        globalThisForMemoryCache.gitbookMemoryCache = new Map();
    } else {
        console.log('Memory cache exists');
    }

    // @ts-ignore
    return globalThisForMemoryCache.gitbookMemoryCache;
}
