import { CacheBackend, CacheEntry } from './types';
import { NON_IMMUTABLE_LOCAL_CACHE_MAX_AGE_SECONDS, isCacheEntryImmutable } from './utils';

export const memoryCache: CacheBackend = {
    name: 'memory',
    replication: 'local',
    async get(key) {
        const memoryCache = await getMemoryCache();
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
        const memoryCache = await getMemoryCache();
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
        const memoryCache = await getMemoryCache();
        keys.forEach((key) => memoryCache.delete(key));
    },
    async revalidateTags(tags) {
        const memoryCache = await getMemoryCache();
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
async function getMemoryCache(): Promise<Map<string, CacheEntry>> {
    let globalThisForMemoryCache: any = globalThis;

    if (process.env.NODE_ENV !== 'test') {
        // We lazy-load the next-on-pages package to avoid errors when running tests because of 'server-only'.
        const { getOptionalRequestContext } = await import('@cloudflare/next-on-pages');
        const cloudflare = getOptionalRequestContext();
        if (cloudflare) {
            globalThisForMemoryCache = cloudflare.ctx;
        }
    }

    if (!globalThisForMemoryCache.gitbookMemoryCache) {
        globalThisForMemoryCache.gitbookMemoryCache = new Map();
    }

    return globalThisForMemoryCache.gitbookMemoryCache;
}
