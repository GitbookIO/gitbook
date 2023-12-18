import { getCache } from './cache';
import { memoryCache } from './memory';
import { redisCache } from './redis';

/**
 * Revalidate all values associated with tags.
 * It clears the values from the caches, but also start a background task to revalidate them.
 */
export async function revalidateTags(tags: string[]): Promise<void> {
    if (tags.length === 0) {
        return;
    }

    await memoryCache.revalidateTags(tags);

    const metas = await redisCache?.revalidateTags(tags);
    if (metas) {
        await Promise.all(
            metas.map(async (meta) => {
                console.log(`revalidating ${meta.cache} with args`, meta.args);
                const cache = getCache(meta.cache);
                if (cache) {
                    await cache.revalidate(...meta.args);
                }
            }),
        );
    }
}
