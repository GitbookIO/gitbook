import { CacheEntryMeta } from './types';

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
