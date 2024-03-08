import { Buffer } from 'node:buffer';

import type { CacheStorage, Cache, Response as WorkerResponse } from '@cloudflare/workers-types';

import { CacheBackend, CacheEntry } from './types';
import { getCacheMaxAge } from './utils';
import { trace } from '../tracing';

const cacheVersion = 1;
const cacheMaxAge = 2 * 60;

/**
 * Cache implementation using the Cloudflare Cache API.
 * https://developers.cloudflare.com/workers/runtime-apis/cache/
 */
export const cloudflareCache: CacheBackend = {
    name: 'cloudflare',
    replication: 'local',
    async get(key, options) {
        const cache = getCache();
        if (!cache) {
            return null;
        }
        return trace(`cloudflareCache.get(${key})`, async (trace) => {
            const cacheKey = await serializeKey(key);
            const response = await cache.match(cacheKey);
            trace.setAttribute('hit', !!response);

            options?.signal?.throwIfAborted();
            if (!response) {
                return null;
            }

            const entry = await deserializeEntry(response);
            return entry;
        });
    },
    async set(key, entry) {
        const cache = getCache();
        if (cache) {
            await trace(`cloudflareCache.set(${key})`, async () => {
                const cacheKey = await serializeKey(key);
                await cache.put(cacheKey, serializeEntry(entry));
            });
        }
    },
    async del(keys) {
        const cache = getCache();
        if (cache) {
            await Promise.all(
                keys.map(async (key) => {
                    const cacheKey = await serializeKey(key);
                    await cache.delete(cacheKey);
                }),
            );
        }
    },
    async revalidateTags(tags) {
        return {
            keys: [],
            metas: [],
        };
    },
};

function getCache(): Cache | null {
    if (typeof caches === 'undefined') {
        return null;
    }

    // @ts-ignore
    return (caches as CacheStorage).default ?? null;
}

async function serializeKey(key: string): Promise<string> {
    const digest = await crypto.subtle.digest(
        {
            name: 'SHA-256',
        },
        new TextEncoder().encode(key),
    );

    const hash = Buffer.from(digest).toString('base64');

    return `gitbook://${cacheVersion}.gitbook.com/${hash}`;
}

function serializeEntry(entry: CacheEntry): WorkerResponse {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const cacheTags = ['gitbook-open', ...entry.meta.tags];

    // Limit the cloudflare cache to a low fix duration
    headers.set('Cache-Control', `public, max-age=${getCacheMaxAge(entry.meta, 10, cacheMaxAge)}`);
    headers.set('Cache-Tag', cacheTags.join(','));

    // @ts-ignore
    return new Response(JSON.stringify(entry), {
        headers,
        cf: {
            cacheTags,
        },
    });
}

async function deserializeEntry(response: WorkerResponse): Promise<CacheEntry> {
    const entry = (await response.json()) as CacheEntry;
    return entry;
}
