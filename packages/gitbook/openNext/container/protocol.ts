import type {
    CacheEntryType,
    CacheValue,
    NextModeTagCacheWriteInput,
    QueueMessage,
} from '@opennextjs/aws/types/overrides.js';

/**
 * Protocol spoken between the Next.js server running inside the container and the cache worker.
 *
 * The container has no Cloudflare bindings, so it issues plain `fetch` calls to this virtual host.
 * They never reach the network: the container Durable Object registers an outbound handler for the
 * host, and that handler runs in the Workers runtime where the `NEXT_INC_CACHE_WORKER` service
 * binding is available.
 */
export const CACHE_HOST = 'incremental-cache.internal';

// Outbound handlers only see ports 80 and 443, and intercepting HTTPS would require trusting a
// per-instance CA inside the image. The handler restores the `https:` scheme before forwarding.
export const CACHE_ORIGIN = `http://${CACHE_HOST}`;

/**
 * `read` deliberately keeps the URL shape used by the workerd tier so both tiers hit the same
 * entry in the cache worker's edge cache.
 */
export const CACHE_PATH = {
    read: '/',
    set: '/set',
    delete: '/delete',
    writeTags: '/write-tags',
    queue: '/queue',
} as const;

export type SetPayload = {
    key: string;
    value: CacheValue<CacheEntryType>;
    cacheType?: CacheEntryType;
};

export type DeletePayload = {
    key: string;
};

export type WriteTagsPayload = {
    tags: NextModeTagCacheWriteInput[];
};

export type QueuePayload = {
    msg: QueueMessage;
};

export function getReadUrl(key: string, cacheType?: CacheEntryType): URL {
    const url = new URL(CACHE_PATH.read, CACHE_ORIGIN);
    url.searchParams.set('key', key);
    if (cacheType) {
        url.searchParams.set('cacheType', cacheType);
    }
    return url;
}
