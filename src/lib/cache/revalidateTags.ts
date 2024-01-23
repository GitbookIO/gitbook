import pMap from 'p-map';

import { cacheBackends } from './backends';
import { getCache, getCacheKey } from './cache';
import { CacheEntryMeta } from './types';

/**
 * Revalidate all values associated with tags.
 * It clears the values from the caches, but also start a background task to revalidate them.
 */
export async function revalidateTags(
    tags: string[],
    purge: boolean,
): Promise<{
    keys: string[];
}> {
    if (tags.length === 0) {
        return { keys: [] };
    }

    const processed = new Set<string>();

    const keysByBackend = new Map<number, string[]>();
    const keys = new Set<string>();
    const metas: CacheEntryMeta[] = [];

    await Promise.all(
        cacheBackends.map(async (backend, backendIndex) => {
            const { keys: addedKeys, metas: addedMetas } = await backend.revalidateTags(
                tags,
                purge,
            );
            addedKeys.forEach((key) => {
                keys.add(key);
                keysByBackend.set(backendIndex, [...(keysByBackend.get(backendIndex) ?? []), key]);
            });
            addedMetas.forEach((meta) => {
                const key = getCacheKey(meta.cache, meta.args);
                if (!processed.has(key)) {
                    metas.push(meta);
                    processed.add(key);
                }
            });
        }),
    );

    // Clear the keys on the backends that didn't return them
    await Promise.all(
        cacheBackends.map(async (backend, backendIndex) => {
            const unclearedKeys = Array.from(keys).filter(
                (key) => !keysByBackend.get(backendIndex)?.includes(key),
            );

            if (unclearedKeys.length > 0) {
                await backend.del(unclearedKeys);
            }
        }),
    );

    // Refresh the values in the cache
    if (metas && !purge) {
        await pMap(
            // Sort to process the entries with the most hits first
            metas.sort((a, b) => b.hits - a.hits),
            async (meta) => {
                console.log(`revalidating ${meta.cache} (${meta.hits} hits) with args`, meta.args);
                const cache = getCache(meta.cache);
                if (cache) {
                    await cache.revalidate(...meta.args);
                }
            },
            {
                concurrency: 5,
            },
        );
    }

    return {
        keys: Array.from(keys.keys()),
    };
}
