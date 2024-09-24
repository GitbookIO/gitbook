import { CacheBackend, CacheEntry, CacheEntryLookup } from './types';
import { NON_IMMUTABLE_LOCAL_CACHE_MAX_AGE_SECONDS, isCacheEntryImmutable } from './utils';
import { getGlobalContext } from '../waitUntil';

export const memoryCache: CacheBackend = {
    name: 'memory',
    replication: 'local',
    async get(entry) {
        const memoryCache = await getMemoryCache();
        const memoryEntry = memoryCache.get(entry.key);

        if (!memoryEntry) {
            return null;
        }

        if (memoryEntry.meta.expiresAt > Date.now()) {
            return memoryEntry;
        } else {
            memoryCache.delete(entry.key);
        }

        return null;
    },
    async set(entry) {
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

        memoryCache.set(entry.meta.key, { ...entry, meta });
    },
    async del(entries) {
        const memoryCache = await getMemoryCache();
        entries.forEach((entry) => memoryCache.delete(entry.key));
    },
    async revalidateTags(tags) {
        const memoryCache = await getMemoryCache();
        const entries: CacheEntryLookup[] = [];

        memoryCache.forEach((entry, key) => {
            if (entry.meta.tag && tags.includes(entry.meta.tag)) {
                entries.push({ key, tag: entry.meta.tag });
                memoryCache.delete(key);
            }
        });

        return {
            entries,
        };
    },
};

/**
 * In memory cache shared globally.
 */
async function getMemoryCache(): Promise<Map<string, CacheEntry>> {
    const ctx: Awaited<ReturnType<typeof getGlobalContext>> & {
        gitbookMemoryCache?: Map<string, CacheEntry>;
    } = await getGlobalContext();

    if (ctx.gitbookMemoryCache) {
        return ctx.gitbookMemoryCache;
    }

    const gitbookMemoryCache = new Map<string, CacheEntry>();
    ctx.gitbookMemoryCache = gitbookMemoryCache;

    return gitbookMemoryCache;
}
