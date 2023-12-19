import pMap from 'p-map';

import { getCache } from './cache';
import { memoryCache } from './memory';
import { redisCache } from './redis';

/**
 * Revalidate all values associated with tags.
 * It clears the values from the caches, but also start a background task to revalidate them.
 */
export async function revalidateTags(tags: string[], purge: boolean): Promise<void> {
    if (tags.length === 0) {
        return;
    }

    await memoryCache.revalidateTags(tags);

    const metas = await redisCache?.revalidateTags(tags);

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
}
