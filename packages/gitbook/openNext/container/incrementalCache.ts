import type {
    CacheEntryType,
    CacheValue,
    IncrementalCache,
    WithLastModified,
} from '@opennextjs/aws/types/overrides.js';

import { internalFetch } from './fetch';
import {
    CACHE_ORIGIN,
    CACHE_PATH,
    type DeletePayload,
    type SetPayload,
    getBuildId,
    getReadUrl,
} from './protocol';

/**
 * Container counterpart of `openNext/incrementalCache/cacheWorkerClient.ts`: same cache worker,
 * reached over the outbound handler instead of a service binding.
 */
export class GitbookContainerIncrementalCache implements IncrementalCache {
    name = 'GitbookContainerIncrementalCache';

    async get<CacheType extends CacheEntryType = 'cache'>(
        key: string,
        cacheType?: CacheType
    ): Promise<WithLastModified<CacheValue<CacheType>> | null> {
        try {
            const response = await internalFetch(getReadUrl(key, cacheType));
            if (!response.ok) {
                console.error('Failed to get from cache worker', response.status);
                return null;
            }

            return (await response.json()) as WithLastModified<CacheValue<CacheType>> | null;
        } catch (error) {
            console.error('Failed to get from cache worker', error);
            return null;
        }
    }

    async set<CacheType extends CacheEntryType = 'cache'>(
        key: string,
        value: CacheValue<CacheType>,
        cacheType?: CacheType
    ): Promise<void> {
        const payload: SetPayload = {
            key,
            value: value as CacheValue<CacheEntryType>,
            cacheType,
            buildId: getBuildId(cacheType),
        };

        try {
            await this.post(CACHE_PATH.set, payload);
        } catch (error) {
            console.error('Failed to set to cache worker', error);
        }
    }

    async delete(key: string): Promise<void> {
        const payload: DeletePayload = { key, buildId: getBuildId() };

        try {
            await this.post(CACHE_PATH.delete, payload);
        } catch (error) {
            console.error('Failed to delete from cache worker', error);
        }
    }

    private async post(path: string, payload: unknown): Promise<void> {
        const response = await internalFetch(new URL(path, CACHE_ORIGIN), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Cache worker responded with ${response.status} for ${path}`);
        }
    }
}

export default new GitbookContainerIncrementalCache();
