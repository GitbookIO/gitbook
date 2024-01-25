import { CacheBackend, CacheEntry } from './types';

/**
 * In production, we limit the cache to 5 minutes as it can't be invalidated on all instances.
 */
const cacheMaxAge = process.env.NODE_ENV === 'development' ? Infinity : 5 * 60;

export const memoryCache: CacheBackend = {
    name: 'memory',
    fallback: true,
    async get(key) {
        const memoryCache = getMemoryCache();
        const memoryEntry = memoryCache.get(key);
        if (!memoryEntry) {
            return null;
        }

        if (memoryEntry.meta.expiresAt > Date.now()) {
            memoryEntry.meta.hits + 1;
            return memoryEntry;
        } else {
            memoryCache.delete(key);
        }

        return null;
    },
    async set(key, entry) {
        const memoryCache = getMemoryCache();
        memoryCache.set(key, {
            ...entry,
            meta: {
                ...entry.meta,
                expiresAt: Math.min(Date.now() + cacheMaxAge * 1000, entry.meta.expiresAt),
            },
        });
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
    // @ts-ignore
    if (!globalThis.gitbookMemoryCache) {
        // @ts-ignore
        globalThis.gitbookMemoryCache = new Map();
    }

    // @ts-ignore
    return globalThis.gitbookMemoryCache;
}
