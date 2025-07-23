import { getLogger } from '@/lib/logger';
import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import { softTagFilter } from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

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
            return 0; // If no tags to check, return 0
        }

        return await originalTagCache.getLastRevalidated(tagsToCheck);
    },
    hasBeenRevalidated: async (tags: string[], lastModified?: number) => {
        const tagsToCheck = tags.filter(softTagFilter);
        if (tagsToCheck.length === 0) {
            return false; // If no tags to check, return false
        }

        return await originalTagCache.hasBeenRevalidated(tagsToCheck, lastModified);
    },
    writeTags: async (tags: string[]) => {
        const tagsToWrite = tags.filter(softTagFilter);
        if (tagsToWrite.length === 0) {
            const logger = getLogger().subLogger('gitbookTagCache');
            logger.warn('writeTags - No valid tags to write');
            return; // If no tags to write, exit early
        }
        // Write only the filtered tags
        await originalTagCache.writeTags(tagsToWrite);
    },
} satisfies NextModeTagCache;
