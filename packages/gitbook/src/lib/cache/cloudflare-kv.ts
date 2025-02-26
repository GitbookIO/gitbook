import type { KVNamespace } from '@cloudflare/workers-types';

import { CacheBackend, CacheEntry, CacheEntryLookup, CacheEntryMeta } from './types';
import { getCacheMaxAge } from './utils';
import { trace } from '../tracing';

const cacheVersion = 2;

interface KVTagMetadata {
    meta: CacheEntryMeta;
}

/**
 * Cache implementation using the Cloudflare KV API.
 * https://developers.cloudflare.com/kv/
 */
export const cloudflareKVCache: CacheBackend = {
    name: 'cloudflare-kv',
    replication: 'global',
    async get(entry, options) {
        const kv = await getKVNamespace();
        if (!kv) {
            return null;
        }

        return trace(
            {
                operation: `cloudflareKV.get`,
                name: entry.key,
            },
            async (span) => {
                const kvKey = getKey(entry);

                const kvEntry = await kv.get<CacheEntry>(kvKey, {
                    type: 'json',
                    cacheTtl: 60,
                });

                span.setAttribute('hit', !!kvEntry);

                return kvEntry;
            },
        );
    },
    async set(entry) {
        const kv = await getKVNamespace();
        if (!kv) {
            return;
        }

        return trace(
            {
                operation: `cloudflareKV.set`,
                name: entry.meta.key,
            },
            async () => {
                const secondsFromNow = getCacheMaxAge(entry.meta, 0, 60 * 60 * 24);

                if (secondsFromNow < 60 * 60) {
                    // We don't cache entries that expire in less than an hour because it takes time for KV to propagate changes.
                    return;
                }

                const kvKey = getKey(entry.meta);
                await kv.put(kvKey, JSON.stringify(entry), {
                    expirationTtl: secondsFromNow,
                });
            },
        );
    },
    async del(entries) {
        const kv = await getKVNamespace();
        if (!kv) {
            return;
        }

        await Promise.all(
            entries.map(async (entry) => {
                const kvKey = getKey(entry);
                await kv.delete(kvKey);
            }),
        );
    },
    async revalidateTags(tags) {
        const result: CacheEntryMeta[] = [];

        const kv = await getKVNamespace();
        if (!kv) {
            return { entries: result };
        }

        const pendingDeletions: Array<Promise<unknown>> = [];

        const iterateKVPage = async (prefix: string, cursor: string | null, max: number = 3) => {
            const entries = await kv.list<KVTagMetadata>({
                prefix,
                cursor,
                limit: 100,
            });

            for (const entry of entries.keys) {
                if (entry.metadata) {
                    const metadata = entry.metadata;
                    result.push(metadata.meta);
                    pendingDeletions.push(kv.delete(entry.name));
                }
            }

            if (!entries.list_complete && max > 0) {
                await iterateKVPage(prefix, entries.cursor, max - 1);
            }
        };

        await Promise.all(
            tags.map(async (tag) => {
                await iterateKVPage(getTagPrefix(tag), null);
            }),
        );

        await Promise.all(pendingDeletions);

        return { entries: result };
    },
};

function getKey(entry: CacheEntryLookup) {
    return `${getTagPrefix(entry.tag || 'default')}.${entry.key}`;
}

function getTagPrefix(tag: string) {
    return `${cacheVersion}.${tag}.`;
}

async function getKVNamespace(): Promise<KVNamespace | null> {
    if (process.env.NODE_ENV === 'test') {
        return null;
    }

    // We lazy-load the next-on-pages package to avoid errors when running tests because of 'server-only'.
    const { getOptionalRequestContext } = await import('@cloudflare/next-on-pages');

    const cloudflare = getOptionalRequestContext();
    if (cloudflare) {
        // @ts-ignore
        return cloudflare.env.CACHE_KV ?? null;
    }

    return null;
}
