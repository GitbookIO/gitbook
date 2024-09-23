import type { CacheObject } from '@gitbook/cache-do';

declare global {
    interface CloudflareEnv {
        CACHE?: DurableObjectNamespace<CacheObject>;
    }
}
