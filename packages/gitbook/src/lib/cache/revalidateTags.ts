import { cacheBackends } from './backends';
import { CacheEntryLookup } from './types';

interface RevalidateTagsStats {
    [key: string]: {
        /**
         * Tag associated with the key.
         */
        tag?: string;

        /**
         * Backends that have the key.
         */
        backends: Record<string, { set: boolean }>;
    };
}

/**
 * Purge all cache entries associated with the given tags.
 * TODO: Implement background revalidation.
 */
export async function revalidateTags(tags: string[]): Promise<{
    stats: RevalidateTagsStats;
}> {
    if (tags.length === 0) {
        return { stats: {} };
    }

    const stats: RevalidateTagsStats = {};

    const keysByBackend = new Map<number, string[]>();
    const entries = new Map<string, CacheEntryLookup>();

    await Promise.all(
        cacheBackends.map(async (backend, backendIndex) => {
            const { entries: addedEntries } = await backend.revalidateTags(tags);

            addedEntries.forEach(({ key, tag }) => {
                stats[key] = stats[key] ?? {
                    tag,
                    backends: {},
                };
                stats[key].backends[backend.name] = { set: true };

                entries.set(key, { tag, key });
                keysByBackend.set(backendIndex, [...(keysByBackend.get(backendIndex) ?? []), key]);
            });
        }),
    );

    // Clear the keys on the backends that didn't return them
    await Promise.all(
        cacheBackends.map(async (backend, backendIndex) => {
            const unclearedEntries = Array.from(entries.values()).filter(
                (entry) => !keysByBackend.get(backendIndex)?.includes(entry.key),
            );

            if (unclearedEntries.length > 0) {
                unclearedEntries.forEach((entry) => {
                    stats[entry.key].backends[backend.name] = { set: false };
                });

                await backend.del(unclearedEntries);
            }
        }),
    );

    return {
        stats,
    };
}
