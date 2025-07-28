import { createLogger, getLogger } from '@/lib/logger';
import { filterOutNullable } from '@/lib/typescript';
import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import { softTagFilter } from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

const originalTagCache = doShardedTagCache({
    baseShardSize: 12,
    // It is broken right now, need to be fixed in OpenNext - We might still not use it depending on how
    // it will be implemented there.
    regionalCache: false,
    shardReplication: {
        numberOfSoftReplicas: 2,
        numberOfHardReplicas: 1,
        regionalReplication: {
            defaultRegion: 'enam',
        },
    },
});

function deduplicateTags(tags: string[]): string[] {
    return Array.from(new Set(tags));
}

function getCacheKey(tag: string) {
    return `http://regional.cache/${tag}`;
}

/**
 * Fetches the last revalidated timestamp for each tag from the regional cache.
 * @param tags The tags to fetch from the cache.
 * @returns A promise that resolves to an array of tuples containing the tag and its last revalidated timestamp.
 */
async function getFromRegionalCache(tags: string[]): Promise<(readonly [string, number])[]> {
    try {
        const cache = await caches.open('tag');

        const responses = await Promise.all(
            tags.map(async (tag) => {
                const resp = await cache.match(getCacheKey(tag));
                if (!resp) {
                    return null;
                }
                return { tag, resp };
            })
        );

        const result = responses
            .filter(filterOutNullable)
            .map(
                async (response) => [response.tag, (await response.resp.json()) as number] as const
            );

        return Promise.all(result);
    } catch {
        return [];
    }
}

/**
 * It will populate the regional cache with the last revalidated timestamp for each tag.
 */
async function updateRegionalCache(tags: string[]) {
    const regionalCache = await caches.open('tag');
    for (const tag of tags) {
        const cacheKey = getCacheKey(tag);
        const lastRevalidated = (await originalTagCache.getLastRevalidated([tag])) || 0;

        await regionalCache.put(
            cacheKey,
            new Response(JSON.stringify(lastRevalidated), {
                headers: {
                    'Content-Type': 'application/json',
                    // We should be safe to cache this for a while.
                    'Cache-Control': 'public, max-age=300',
                    'Cache-Tag': tag,
                },
            })
        );
    }
}

async function deleteFromRegionalCache(tags: string[]) {
    const regionalCache = await caches.open('tag');
    await Promise.all(
        tags.map(async (tag) => {
            const cacheKey = getCacheKey(tag);
            await regionalCache.delete(cacheKey);
        })
    );
}

export default {
    name: 'GitbookTagCache',
    mode: 'nextMode',
    // We don't really use this one, as of now it is only used for soft tags
    getLastRevalidated: async (tags: string[]) => {
        const tagsToCheck = tags.filter(softTagFilter);
        if (tagsToCheck.length === 0) {
            return 0; // If no tags to check, return 0
        }
        const deduplicatedTags = deduplicateTags(tagsToCheck);

        return await originalTagCache.getLastRevalidated(deduplicatedTags);
    },
    hasBeenRevalidated: async (tags: string[], lastModified?: number) => {
        try {
            const tagsToCheck = tags.filter(softTagFilter);
            if (tagsToCheck.length === 0) {
                return false; // If no tags to check, return false
            }

            const deduplicatedTags = deduplicateTags(tagsToCheck);
            const regionalCacheResult = await getFromRegionalCache(deduplicatedTags);
            if (regionalCacheResult.length > 0) {
                // If we have results from the regional cache, check if any of them are newer than lastModified
                const cacheRevalidated = regionalCacheResult.some(
                    ([_, timestamp]) => timestamp >= (lastModified ?? 0)
                );
                if (cacheRevalidated) {
                    // If any tag is revalidated, we can return true
                    return true;
                }
            }

            const remainingTags = deduplicatedTags.filter(
                (tag) => !regionalCacheResult.some(([cachedTag]) => cachedTag === tag)
            );
            if (remainingTags.length > 0) {
                // If there are remaining tags, check their status in the original cache
                const result = await originalTagCache.hasBeenRevalidated(
                    remainingTags,
                    lastModified
                );
                getCloudflareContext().ctx.waitUntil(updateRegionalCache(remainingTags));
                return result;
            }
            return false; // If no tags were found in the regional cache and no remaining tags, return false
        } catch (e) {
            createLogger('gitbookTagCache', {}).error(
                `hasBeenRevalidated - Error checking tags ${tags.join(', ')}`,
                e
            );
            return false; // In case of error, return false
        }
    },
    writeTags: async (tags: string[]) => {
        const tagsToWrite = tags.filter(softTagFilter);
        if (tagsToWrite.length === 0) {
            const logger = getLogger().subLogger('gitbookTagCache');
            logger.warn('writeTags - No valid tags to write');
            return; // If no tags to write, exit early
        }

        const deduplicatedTags = deduplicateTags(tagsToWrite);

        // Write only the filtered tags
        await originalTagCache.writeTags(deduplicatedTags);

        /**
         * Delete from the regional cache.
         * We don't update it with new value so that we keep the DO as the single source of truth.
         */
        await deleteFromRegionalCache(deduplicatedTags);
    },
} satisfies NextModeTagCache;
