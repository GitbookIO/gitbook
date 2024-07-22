import { cacheBackends } from './backends';
import { getCacheKey } from './cache';
import { CacheEntryMeta } from './types';

interface RevalidateTagsStats {
    [key: string]: {
        /**
         * Backends that have the key.
         */
        [backend: string]: { set: boolean; setAt?: number; expiresAt?: number };
    };
}

/**
 * Revalidate all values associated with tags.
 * It clears the values from the caches, but also start a background task to revalidate them.
 */
export async function revalidateTags(tags: string[]): Promise<{
    keys: string[];
    stats: RevalidateTagsStats;
}> {
    if (tags.length === 0) {
        return { keys: [], stats: {} };
    }

    const stats: RevalidateTagsStats = {};

    const processed = new Set<string>();

    const keysByBackend = new Map<number, string[]>();
    const keys = new Set<string>();
    const metas: CacheEntryMeta[] = [];

    await Promise.all(
        cacheBackends.map(async (backend, backendIndex) => {
            const { keys: addedKeys, metas: addedMetas } = await backend.revalidateTags(tags);

            console.log('revalidateTags', backend.name, addedKeys);

            addedKeys.forEach((key) => {
                stats[key] = stats[key] ?? {};
                stats[key][backend.name] = { set: true };

                keys.add(key);
                keysByBackend.set(backendIndex, [...(keysByBackend.get(backendIndex) ?? []), key]);
            });
            addedMetas.forEach((meta) => {
                const key = meta.key ?? getCacheKey(meta.cache, meta.args);
                stats[key] = stats[key] ?? {};
                stats[key][backend.name] = { set: true };
                stats[key][backend.name].setAt = meta.setAt;
                stats[key][backend.name].expiresAt = meta.expiresAt;

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
                unclearedKeys.forEach((key) => {
                    stats[key][backend.name] = { set: false };
                });

                await backend.del(unclearedKeys);
            }
        }),
    );

    return {
        keys: Array.from(keys.keys()),
        stats,
    };
}
