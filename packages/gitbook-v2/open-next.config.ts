import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

export default defineCloudflareConfig({
    incrementalCache: withRegionalCache(r2IncrementalCache, { mode: 'short-lived' }),
    tagCache: doShardedTagCache({
        baseShardSize: 12,
        regionalCache: true,
        shardReplication: {
            numberOfSoftReplicas: 2,
            numberOfHardReplicas: 1,
        },
    }),
    queue: doQueue,
});
