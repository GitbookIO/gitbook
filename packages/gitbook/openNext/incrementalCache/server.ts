import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import { GitbookIncrementalCache } from './incrementalCache';

// export default withRegionalCache(new GitbookIncrementalCache(), {
//     mode: 'long-lived',
//     // Because of a race condition, the middleware may have populated the cache entry before `cache.match` had time to run on the server.
//     // TODO: We should bypass the incremental cache entirely when the interceptor has caught the request. Should be done in OpenNext.
//     bypassTagCacheOnCacheHit: false,
//     //TODO: remove, reducing cache ttl of regional cache to help debugging
//     defaultLongLivedTtlSec: 5 * 60 /* 5 minutes */,
//     // We don't want to update the cache entry on every cache hit
//     shouldLazilyUpdateOnCacheHit: false,
// });

//TODO: reenable regional cache once we know what's going on
export default new GitbookIncrementalCache();
