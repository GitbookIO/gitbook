import { Buffer } from 'node:buffer';

import type { CacheStorage, Cache, Response as WorkerResponse } from '@cloudflare/workers-types';

import { CacheBackend, CacheEntry } from './types';

const cacheVersion = 1;
const cacheMaxAge = 5 * 60;

/**
 * Cache implementation using the Cloudflare Cache API.
 * https://developers.cloudflare.com/workers/runtime-apis/cache/
 */
export const cloudflareCache: CacheBackend = {
    name: 'cloudflare',
    fallback: true,
    async get(key, options) {
        const cache = getCache();
        if (!cache) {
            return null;
        }

        const cacheKey = await serializeKey(key);
        const response = await cache.match(cacheKey);
        if (!response || options?.signal?.aborted) {
            return null;
        }

        const entry = await deserializeEntry(response);
        return entry;
    },
    async set(key, entry) {
        const cache = getCache();
        if (cache) {
            const cacheKey = await serializeKey(key);
            await cache.put(cacheKey, serializeEntry(entry));
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

    // Limit the cloudflare cache to 5 minutes
    headers.set(
        'Cache-Control',
        `public, max-age=${Math.min((entry.meta.expiresAt - Date.now()) / 1000, cacheMaxAge)}`,
    );
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
