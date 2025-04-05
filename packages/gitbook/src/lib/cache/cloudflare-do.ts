import { type CacheLocationId, CacheObjectStub } from '@gitbook/cache-do/api';

import { trace } from '../tracing';
import type { CacheBackend, CacheEntry, CacheEntryLookup } from './types';

/**
 * Cache implementation using the custom Cloudflare Durable Object.
 */
export const cloudflareDOCache: CacheBackend = {
    name: 'cloudflare-do',
    replication: 'global',
    async get(entry, _options) {
        const { key, tag } = entry;
        if (!tag) {
            return null;
        }

        return trace(
            {
                operation: 'cloudflareDO.get',
                name: entry.key,
            },
            async (_span) => {
                const stub = await getStub(tag);
                if (!stub) {
                    return null;
                }

                try {
                    return (await stub.get<CacheEntry>(key)) ?? null;
                } catch (err) {
                    console.error('cloudflareDO.get', err);
                    return null;
                }
            }
        );
    },
    async set(entry) {
        const { key, tag } = entry.meta;
        if (!tag) {
            return;
        }

        return trace(
            {
                operation: 'cloudflareDO.set',
                name: key,
            },
            async () => {
                const stub = await getStub(tag);
                if (!stub) {
                    return;
                }

                await stub.set<CacheEntry>(key, entry, entry.meta.expiresAt);
            }
        );
    },
    async del(_entries) {
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

                const keys = await retryOnDurableObjectError(async () => {
                    return await stub.purge();
                });

                keys.forEach((key) => {
                    entries.push({ key, tag });
                });
            })
        );

        return { entries };
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

/**
 * Retry an operation on a Durable Object if it fails with a retriable error.
 * It will retry up to 4 times with an exponential backoff.
 */
export async function retryOnDurableObjectError<T>(
    operation: () => T | Promise<T>,
    attemptsLeft = 4,
    delay = 50
): Promise<T> {
    if (attemptsLeft <= 0) {
        return operation();
    }

    try {
        return await operation();
    } catch (error) {
        if (!shouldRetryError(error)) {
            throw error;
        }

        if (attemptsLeft > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            return retryOnDurableObjectError(operation, attemptsLeft - 1, delay * 2);
        }

        throw error;
    }
}

const RETRIABLE_ERROR_MESSAGES = new Set([
    'Cannot resolve Durable Object due to transient issue on remote node.',
    'internal error',
    `Durable Object's isolate exceeded its memory limit and was reset.`,
    'cannot access storage because object has moved to a different machine',
    'Durable Object reset because its code was updated.',
    "The Durable Object's code has been updated, this version can no longer access storage.",
    // https://developers.cloudflare.com/workers/observability/errors/#runtime-errors
    'Network connection lost.',
]);

/**
 * Check if an error should be retried based on its error message.
 */
function shouldRetryError(error: unknown): boolean {
    return error instanceof Error && RETRIABLE_ERROR_MESSAGES.has(error.message);
}
