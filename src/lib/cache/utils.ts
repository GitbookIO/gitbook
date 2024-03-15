import { CacheEntryMeta } from './types';

/**
 * For mutable entries, we limit the cache to 30 seconds
 * as it could be invalidated at any time.
 */
export const NON_IMMUTABLE_LOCAL_CACHE_MAX_AGE_SECONDS = 30;

/**
 * Get the max-age in seconds for a cache entry.
 */
export function getCacheMaxAge(meta: CacheEntryMeta, min?: number, max?: number): number {
    let maxAge = Math.max(min ?? 0, Math.round((meta.expiresAt - Date.now()) / 1000));

    if (max) {
        maxAge = Math.min(max, maxAge);
    }

    return maxAge;
}

/**
 * Return true if a cache entry can be considered immutable.
 */
export function isCacheEntryImmutable(meta: CacheEntryMeta): boolean {
    return !meta.tags || meta.tags.length === 0;
}
