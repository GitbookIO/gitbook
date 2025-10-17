import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import { GitbookIncrementalCache } from './incrementalCache';

export default withRegionalCache(new GitbookIncrementalCache(), {
    mode: 'long-lived',
    // We can do it because we use our own logic to invalidate the cache
    bypassTagCacheOnCacheHit: true,
    defaultLongLivedTtlSec: 60 * 60 * 24 /* 24 hours */,
    // We don't want to update the cache entry on every cache hit
    shouldLazilyUpdateOnCacheHit: false,
});
