import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import {
    softTagFilter,
    withFilter,
} from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

export default defineCloudflareConfig({
    incrementalCache: withRegionalCache(r2IncrementalCache, { mode: 'long-lived' }),
    tagCache: withFilter({
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
    }),
    queue: doQueue,
});
