import { CacheObjectStub, CacheLocationId } from '@gitbook/cache-do/api';

import { CacheBackend, CacheEntry, CacheEntryLookup } from './types';
import { trace } from '../tracing';

/**
 * Cache implementation using the custom Cloudflare Durable Object.
 */
export const cloudflareDOCache: CacheBackend = {
    name: 'cloudflare-do',
    replication: 'global',
    async get(entry, options) {
        const { key, tag } = entry;
        if (!tag) {
            return null;
        }

        return trace(
            {
                operation: `cloudflareDO.get`,
                name: entry.key,
            },
            async (span) => {
                const stub = await getStub(tag);
                if (!stub) {
                    return null;
                }

                return (await stub.get<CacheEntry>(key)) ?? null;
            },
        );
    },
    async set(entry) {
        const { key, tag } = entry.meta;
        if (!tag) {
            return;
        }

        return trace(
            {
                operation: `cloudflareDO.set`,
                name: key,
            },
            async () => {
                const stub = await getStub(tag);
                if (!stub) {
                    return;
                }

                await stub.set<CacheEntry>(key, entry, entry.meta.expiresAt);
            },
        );
    },
    async del(entries) {
        // We don't need to directly delete entries from the Cloudflare DO cache.
    },
    async revalidateTags(tags) {
        const entries: CacheEntryLookup[] = [];

        await Promise.all(
            tags.map(async (tag) => {
                const stub = await getStub(tag);
                if (!stub) {
                    return;
                }

                const keys = await stub.purge();
                keys.forEach((key) => {
                    entries.push({ key, tag });
                });
            }),
        );

        return { entries: [] };
    },
};

const globalStubs = new WeakMap<object, Map<string, CacheObjectStub>>();

async function getStub(tag: string): Promise<CacheObjectStub | null> {
    if (process.env.NODE_ENV === 'test') {
        return null;
    }

    // We lazy-load the next-on-pages package to avoid errors when running tests because of 'server-only'.
    const { getOptionalRequestContext } = await import('@cloudflare/next-on-pages');
    const cloudflare = getOptionalRequestContext();
    if (!cloudflare || !cloudflare.env.CACHE) {
        return null;
    }

    const requestStubs = globalStubs.get(cloudflare.cf) ?? new Map();
    globalStubs.set(cloudflare.cf, requestStubs);

    const locationId: CacheLocationId = cloudflare.cf.continent ?? 'NA';
    const stub =
        requestStubs.get(tag) ?? new CacheObjectStub(cloudflare.env.CACHE, locationId, tag);
    requestStubs.set(tag, stub);

    return stub;
}
