import { CacheBackend, CacheEntry } from './types';

export const memoryCache: CacheBackend = {
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
        memoryCache.set(key, entry);
    },
    async revalidateTags(tags) {
        const memoryCache = getMemoryCache();

        memoryCache.forEach((entry, key) => {
            if (tags.some((tag) => entry.meta.tags.includes(tag))) {
                memoryCache.delete(key);
            }
        });

        return [];
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
