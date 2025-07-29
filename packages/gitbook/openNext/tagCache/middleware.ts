import { createLogger, getLogger } from '@/lib/logger';
import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import { softTagFilter } from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

const originalTagCache = doShardedTagCache({
    baseShardSize: 12,
    regionalCache: true,
    regionalCacheTtlSec: 60 * 5 /* 5 minutes */,
    // Because we invalidate the Cache API on update, we can safely set this to true
    regionalCacheDangerouslyPersistMissingTags: true,
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
    // We don't really use this one, as of now it is only used for soft tags
    getLastRevalidated: async (tags: string[]) => {
        const tagsToCheck = tags.filter(softTagFilter);
        if (tagsToCheck.length === 0) {
            return 0; // If no tags to check, return 0
        }

        return await originalTagCache.getLastRevalidated(tagsToCheck);
    },
    hasBeenRevalidated: async (tags: string[], lastModified?: number) => {
        try {
            const tagsToCheck = tags.filter(softTagFilter);
            if (tagsToCheck.length === 0) {
                return false; // If no tags to check, return false
            }

            return await originalTagCache.hasBeenRevalidated(tagsToCheck, lastModified);
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

        await originalTagCache.writeTags(tagsToWrite);
    },
} satisfies NextModeTagCache;
