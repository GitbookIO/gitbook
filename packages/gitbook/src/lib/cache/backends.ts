import { cloudflareCache } from './cloudflare-cache';
import { cloudflareDOCache } from './cloudflare-do';
import { memoryCache } from './memory';

export const cacheBackends = [
    // Cache local to the process
    // (can't be globally purged or shared between processes)
    memoryCache,
    // Cache local to the datacenter
    // It can't be purged globally but it's faster
    cloudflareCache,
    // Global cache with slower performances
    cloudflareDOCache,
];
