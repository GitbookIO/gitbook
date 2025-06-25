import { trace } from '@/lib/tracing';
import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import { softTagFilter } from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';
import { getLogger } from '@v2/lib/logger';

const originalTagCache = doShardedTagCache({
    baseShardSize: 12,
    regionalCache: true,
    // We can probably increase this value even further
    regionalCacheTtlSec: 60,
    shardReplication: {
        numberOfSoftReplicas: 2,
        numberOfHardReplicas: 1,
        regionalReplication: {
            defaultRegion: 'enam',
        },
    },
});

export default {
    name: 'GitbookTagCache',
    mode: 'nextMode',
    getLastRevalidated: async (tags: string[]) => {
        const tagsToCheck = tags.filter(softTagFilter);
        if (tagsToCheck.length === 0) {
            const logger = getLogger().subLogger('gitbookTagCache');
            // If we reach here, it probably means that there is an issue that we'll need to address.
            logger.warn(
                'getLastRevalidated - No valid tags to check for last revalidation, original tags:',
                tags
            );
            return 0; // If no tags to check, return 0
        }
        return trace(
            {
                operation: 'gitbookTagCacheGetLastRevalidated',
                name: tagsToCheck.join(', '),
            },
            async () => {
                return await originalTagCache.getLastRevalidated(tagsToCheck);
            }
        );
    },
    hasBeenRevalidated: async (tags: string[], lastModified?: number) => {
        const tagsToCheck = tags.filter(softTagFilter);
        if (tagsToCheck.length === 0) {
            const logger = getLogger().subLogger('gitbookTagCache');
            // If we reach here, it probably means that there is an issue that we'll need to address.
            logger.warn(
                'hasBeenRevalidated - No valid tags to check for revalidation, original tags:',
                tags
            );
            return false; // If no tags to check, return false
        }
        return trace(
            {
                operation: 'gitbookTagCacheHasBeenRevalidated',
                name: tagsToCheck.join(', '),
            },
            async () => {
                const result = await originalTagCache.hasBeenRevalidated(tagsToCheck, lastModified);
                return result;
            }
        );
    },
    writeTags: async (tags: string[]) => {
        return trace(
            {
                operation: 'gitbookTagCacheWriteTags',
                name: tags.join(', '),
            },
            async () => {
                const tagsToWrite = tags.filter(softTagFilter);
                if (tagsToWrite.length === 0) {
                    const logger = getLogger().subLogger('gitbookTagCache');
                    logger.warn('writeTags - No valid tags to write');
                    return; // If no tags to write, exit early
                }
                // Write only the filtered tags
                await originalTagCache.writeTags(tagsToWrite);
            }
        );
    },
} satisfies NextModeTagCache;
