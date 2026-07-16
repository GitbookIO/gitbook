// import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import { GitbookIncrementalCache } from './cacheWorkerClient';

// // We cannot have regional cache only in the middleware, otherwise it will override things on cache miss
// // and cause race conditions. This will be fixed in a future release of OpenNext
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

export default new GitbookIncrementalCache();