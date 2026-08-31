import type {
    CacheEntryType,
    CacheValue,
    NextModeTagCacheWriteInput,
    QueueMessage,
} from '@opennextjs/aws/types/overrides.js';

/**
 * Protocol spoken to the cache worker, by both server tiers.
 *
 * The workerd tier reaches it through the `NEXT_INC_CACHE_WORKER` service binding. The container
 * has no Cloudflare bindings, so it issues plain `fetch` calls to this virtual host instead; they
 * never reach the network, because the container Durable Object registers an outbound handler for
 * the host that runs in the Workers runtime where the binding is available.
 *
 * Both tiers build their requests here so they address a cache entry identically — the read URL is
 * the cache worker's edge cache key, so any divergence would split that entry in two.
 */
export const CACHE_HOST = 'incremental-cache.internal';

// Outbound handlers only see ports 80 and 443, and intercepting HTTPS would require trusting a
// per-instance CA inside the image. The handler restores the `https:` scheme before forwarding.
export const CACHE_ORIGIN = `http://${CACHE_HOST}`;

// What the cache worker actually sees, and so what the workerd tier sends directly.
export const CACHE_ORIGIN_SECURE = `https://${CACHE_HOST}`;

/** `read` is built by `getReadUrl` on both tiers, so they share one edge cache entry. */
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
    buildId?: string;
};

export type DeletePayload = {
    key: string;
    buildId?: string;
};

export type WriteTagsPayload = {
    tags: NextModeTagCacheWriteInput[];
};

export type QueuePayload = {
    msg: QueueMessage;
};

/**
 * Build ID the calling tier's entries belong to.
 *
 * The cache worker namespaces `cache` entries per build but ships with the container worker, so
 * during a gradual rollout of the workerd tier its own build ID is not the one the entry belongs
 * to — callers have to send theirs. `fetch` and `composable` entries live in the shared `dataCache`
 * namespace, so they deliberately resolve to `undefined`.
 */
export function getBuildId(cacheType?: CacheEntryType): string | undefined {
    if (cacheType && cacheType !== 'cache') {
        return undefined;
    }

    return process.env.OPEN_NEXT_BUILD_ID ?? process.env.DEPLOYMENT_ID;
}

/**
 * TODO: temporary. Set `DEBUG_CACHE_KEYS=true` on a worker to trace how a cache entry is
 * addressed, end to end: what the caller sends, what the cache worker resolves, and whether the
 * answer came from the cache worker's own response cache rather than R2.
 */
export function logCacheDebug(scope: string, fields: Record<string, unknown>): void {
    if (process.env.DEBUG_CACHE_KEYS !== 'true') {
        return;
    }

    console.log(`[cache-keys] ${scope} ${JSON.stringify(fields)}`);
}

export function getReadUrl(
    key: string,
    cacheType?: CacheEntryType,
    origin: string = CACHE_ORIGIN
): URL {
    const url = new URL(CACHE_PATH.read, origin);
    url.searchParams.set('key', key);
    if (cacheType) {
        url.searchParams.set('cacheType', cacheType);
    }
    const buildId = getBuildId(cacheType);
    if (buildId) {
        url.searchParams.set('buildId', buildId);
    }
    return url;
}
