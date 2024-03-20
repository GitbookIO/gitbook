import type { KVNamespace } from '@cloudflare/workers-types';

import { CacheBackend, CacheEntry, CacheEntryMeta } from './types';
import { getCacheMaxAge } from './utils';
import { trace } from '../tracing';

const cacheVersion = 1;

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
    async get(key, options) {
        const kv = await getKVNamespace();
        if (!kv) {
            return null;
        }

        return trace(
            {
                operation: `cloudflareKV.get`,
                name: key,
            },
            async (span) => {
                const kvKey = getValueKey(key);

                const entry = await kv.get<CacheEntry>(kvKey, {
                    type: 'json',
                    cacheTtl: 60,
                });

                span.setAttribute('hit', !!entry);

                return entry;
            },
        );
    },
    async set(key, entry) {
        const kv = await getKVNamespace();
        if (!kv) {
            return;
        }

        return trace(
            {
                operation: `cloudflareKV.set`,
                name: key,
            },
            async () => {
                const secondsFromNow = getCacheMaxAge(entry.meta, 0, 60 * 60 * 24);

                if (secondsFromNow < 60 * 60) {
                    // We don't cache entries that expire in less than an hour because it takes time for KV to propagate changes.
                    return;
                }

                const kvKey = getValueKey(key);
                await kv.put(kvKey, JSON.stringify(entry), {
                    expirationTtl: secondsFromNow,
                });

                if (entry.meta.tags.length > 0) {
                    const metadata: KVTagMetadata = {
                        meta: entry.meta,
                    };
                    const jsonMetadata = JSON.stringify(metadata);

                    // Write a key for each tag
                    await Promise.all(
                        entry.meta.tags.map(async (tag) => {
                            const tagKey = getTagKey(tag, key);

                            await kv.put(tagKey, jsonMetadata, {
                                metadata,
                                expirationTtl: secondsFromNow,
                            });
                        }),
                    );
                }
            },
        );
    },
    async del(keys) {
        const kv = await getKVNamespace();
        if (!kv) {
            return;
        }

        await Promise.all(
            keys.map(async (key) => {
                const kvKey = getValueKey(key);
                await kv.delete(kvKey);
            }),
        );
    },
    async revalidateTags(tags) {
        const result: { keys: string[]; metas: CacheEntryMeta[] } = {
            keys: [],
            metas: [],
        };

        const kv = await getKVNamespace();
        if (!kv) {
            return result;
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
                    const key = metadata.meta.key;

                    result.metas.push(metadata.meta);
                    result.keys.push(key);

                    // Delete the tag key and the value key
                    pendingDeletions.push(kv.delete(getValueKey(key)));
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

        return result;
    },
};

function getValueKey(key: string): string {
    return `${cacheVersion}.v.${key}`;
}

function getTagPrefix(tag: string) {
    return `${cacheVersion}.tag.${tag}.`;
}

function getTagKey(tag: string, key: string) {
    return `${getTagPrefix(tag)}${key}`;
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
