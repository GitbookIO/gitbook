import { cloudflareCache } from './cloudflare';
import { memoryCache } from './memory';
import { redisCache } from './redis';

export const cacheBackends = [
    memoryCache,
    redisCache,
    // Cloudflare should be last to delete its cache from the listing of redis/memory
    cloudflareCache,
];
