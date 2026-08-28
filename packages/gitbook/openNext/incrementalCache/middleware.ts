import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';

import { GitbookIncrementalCache, with404Guard } from './incrementalCache';

// The guard wraps the regional cache: its entries are written at set time and served
// without going through GitbookIncrementalCache.get (RND-12656).
export default with404Guard(
    withRegionalCache(new GitbookIncrementalCache(), {
        mode: 'long-lived',
        // We can do it because we use our own logic to invalidate the cache
        bypassTagCacheOnCacheHit: true,
        //TODO: bump it again once I figured out the race condition
        defaultLongLivedTtlSec: 5 * 60, // 5 minutes
        // We don't want to update the cache entry on every cache hit
        shouldLazilyUpdateOnCacheHit: false,
    })
);
