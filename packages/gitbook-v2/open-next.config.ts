import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/kv-cache';
import memoryQueue from '@opennextjs/cloudflare/memory-queue';

export default defineCloudflareConfig({
    incrementalCache: kvIncrementalCache,
    queue: memoryQueue,
});
