import { CacheBackend, CacheEntry } from './types';
import { NON_IMMUTABLE_LOCAL_CACHE_MAX_AGE_SECONDS, isCacheEntryImmutable } from './utils';
import { getGlobalContext } from '../waitUntil';

export const memoryCache: CacheBackend = {
    name: 'memory',
    replication: 'local',
    async get(key) {
        const memoryCache = getMemoryCache();
        const memoryEntry = memoryCache.get(key);

        console.log(`${memoryEntry ? 'memory hit' : 'memory miss'} for key: ${key}`)
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
 * In memory cache shared globally.
 */
function getMemoryCache(): Map<string, CacheEntry> {
    const ctx: ReturnType<typeof getGlobalContext> & {
        gitbookMemoryCache?: Map<string, CacheEntry>;
    } = getGlobalContext();

    if (ctx.gitbookMemoryCache) {
        console.log('getMemoryCache - cache already exists');
        return ctx.gitbookMemoryCache;
    }

    console.log('getMemoryCache - creating cache');
    const gitbookMemoryCache = new Map<string, CacheEntry>();
    ctx.gitbookMemoryCache = gitbookMemoryCache;

    return gitbookMemoryCache;
}
