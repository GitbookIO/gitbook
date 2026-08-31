import type {
    CacheEntryType,
    CacheValue,
    IncrementalCache,
    WithLastModified,
} from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { CACHE_ORIGIN_SECURE, getBuildId, getReadUrl, logCacheDebug } from '../container/protocol';

export const BINDING_NAME = 'NEXT_INC_CACHE_WORKER';

type CacheWorker = {
    fetch(request: Request): Promise<Response>;
    set<CacheType extends CacheEntryType>(
        key: string,
        value: CacheValue<CacheType>,
        cacheType?: CacheType,
        buildId?: string
    ): Promise<void>;
    delete(key: string, buildId?: string): Promise<void>;
};

export class GitbookIncrementalCache implements IncrementalCache {
    name = 'GitbookIncrementalCache';

    async get<CacheType extends CacheEntryType = 'cache'>(
        key: string,
        cacheType?: CacheType
    ): Promise<WithLastModified<CacheValue<CacheType>> | null> {
        try {
            const url = getReadUrl(key, cacheType, CACHE_ORIGIN_SECURE);
            logCacheDebug('workerd.get', {
                cacheType: cacheType ?? 'cache',
                sentBuildId: url.searchParams.get('buildId'),
                envOpenNextBuildId: process.env.OPEN_NEXT_BUILD_ID,
                envDeploymentId: process.env.DEPLOYMENT_ID,
                url: url.toString(),
            });

            const response = await this.getWorker().fetch(new Request(url));
            logCacheDebug('workerd.get.response', {
                status: response.status,
                // Set by the cache worker's response cache: a HIT here means the answer never
                // reached R2, so the R2 key's build namespace was bypassed entirely.
                cfCacheStatus: response.headers.get('cf-cache-status'),
                age: response.headers.get('age'),
                revalidated: response.headers.get('x-gitbook-cache-revalidated'),
            });
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
        try {
            const buildId = getBuildId(cacheType);
            logCacheDebug('workerd.set', {
                cacheType: cacheType ?? 'cache',
                sentBuildId: buildId,
                envOpenNextBuildId: process.env.OPEN_NEXT_BUILD_ID,
            });
            await this.getWorker().set(key, value, cacheType, buildId);
        } catch (error) {
            console.error('Failed to set to cache worker', error);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await this.getWorker().delete(key, getBuildId());
        } catch (error) {
            console.error('Failed to delete from cache worker', error);
        }
    }

    private getWorker(): CacheWorker {
        const env = getCloudflareContext().env as Record<string, unknown>;
        const worker = env[BINDING_NAME] as CacheWorker | undefined;
        if (!worker) {
            throw new Error(`Missing ${BINDING_NAME} service binding`);
        }
        return worker;
    }
}

export default new GitbookIncrementalCache();
