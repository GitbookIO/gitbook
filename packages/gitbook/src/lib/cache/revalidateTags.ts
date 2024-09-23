import { cacheBackends } from './backends';

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
 * Revalidate all values associated with tags.
 * It clears the values from the caches, but also start a background task to revalidate them.
 */
export async function revalidateTags(tags: string[]): Promise<{
    stats: RevalidateTagsStats;
}> {
    if (tags.length === 0) {
        return { stats: {} };
    }

    const stats: RevalidateTagsStats = {};

    const keysByBackend = new Map<number, string[]>();
    const keys = new Set<string>();

    await Promise.all(
        cacheBackends.map(async (backend, backendIndex) => {
            const { entries: addedEntries } = await backend.revalidateTags(tags);

            console.log('revalidateTags', backend.name, addedEntries.length);

            addedEntries.forEach(({ key, tag }) => {
                stats[key] = stats[key] ?? {
                    tag,
                    backends: {},
                };
                stats[key].backends[backend.name] = { set: true };

                keys.add(key);
                keysByBackend.set(backendIndex, [...(keysByBackend.get(backendIndex) ?? []), key]);
            });
        }),
    );

    // Clear the keys on the backends that didn't return them
    // await Promise.all(
    //     cacheBackends.map(async (backend, backendIndex) => {
    //         const unclearedKeys = Array.from(keys).filter(
    //             (key) => !keysByBackend.get(backendIndex)?.includes(key),
    //         );

    //         if (unclearedKeys.length > 0) {
    //             unclearedKeys.forEach((key) => {
    //                 stats[key][backend.name] = { set: false };
    //             });

    //             await backend.del(unclearedKeys);
    //         }
    //     }),
    // );

    return {
        stats,
    };
}
