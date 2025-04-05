import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';

export default defineCloudflareConfig({
    incrementalCache: kvIncrementalCache,
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
