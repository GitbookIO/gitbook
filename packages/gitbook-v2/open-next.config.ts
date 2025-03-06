import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import d1TagCache from '@opennextjs/cloudflare/d1-tag-cache';
import kvIncrementalCache from '@opennextjs/cloudflare/kv-cache';
import memoryQueue from '@opennextjs/cloudflare/memory-queue';

export default defineCloudflareConfig({
    incrementalCache: kvIncrementalCache,
    queue: memoryQueue,
    tagCache: d1TagCache,
});
