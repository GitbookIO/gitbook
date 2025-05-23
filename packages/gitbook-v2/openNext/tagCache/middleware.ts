import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache';
import {
    softTagFilter,
    withFilter,
} from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

export default withFilter({
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
