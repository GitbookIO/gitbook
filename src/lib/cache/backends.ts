import { cloudflareCache } from './cloudflare-cache';
import { cloudflareKVCache } from './cloudflare-kv';
import { memoryCache } from './memory';
import { redisCache } from './redis';

export const cacheBackends = [
    // Cache local to the process
    // (can't be globally purged or shared between processes)
    // memoryCache,
    // Global cache shared between all processes
    // with proper replication and invalidation
    // redisCache, // Disabled as we investigate high amount of fetch requests
    // Cache local to the datacenter
    // It can't be purged globally but it's faster
    cloudflareCache,
    // Cache global, but with slow replication
    cloudflareKVCache,
];
