import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import {
    softTagFilter,
    withFilter,
} from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

const filteredTagCache = withFilter({
    tagCache: doShardedTagCache({
        baseShardSize: 12,
        regionalCache: true,
        shardReplication: {
            numberOfSoftReplicas: 2,
            numberOfHardReplicas: 1,
        },
    }),
    // We don't use `revalidatePath`, so we filter out soft tags
    filterFn: softTagFilter,
});

export default {
    name: 'GitbookTagCache',
    mode: 'nextMode',
    getLastRevalidated: async (tags: string[]) => {
        try {
            return await filteredTagCache.getLastRevalidated(tags);
        } catch (error) {
            console.error('Error getting last revalidated tags:', error);
            return 0; // Fallback to 0 if there's an error
        }
    },
    hasBeenRevalidated: async (tags: string[]) => {
        try {
            return await filteredTagCache.hasBeenRevalidated(tags);
        } catch (error) {
            console.error('Error checking if tags have been revalidated:', error);
            return false; // Fallback to false if there's an error
        }
    },
    writeTags: async (tags: string[]) => {
        try {
            await filteredTagCache.writeTags(tags);
        } catch (error) {
            console.error('Error writing tags:', error);
        }
    },
} satisfies NextModeTagCache;
