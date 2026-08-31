import type {
    CacheEntryType,
    CacheValue,
    IncrementalCache,
    WithLastModified,
} from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const BINDING_NAME = 'NEXT_INC_CACHE_WORKER';

/**
 * The cache worker namespaces `cache` entries per build, but it ships with the container worker and
 * is deployed in one go, while this tier rolls out gradually — so during a rollout its build ID is
 * not the one our entries belong to and we have to send ours. `fetch` and `composable` entries live
 * in the shared `dataCache` namespace, hence the `undefined`.
 */
function getBuildId(cacheType?: CacheEntryType): string | undefined {
    if (cacheType && cacheType !== 'cache') {
        return undefined;
    }

    return process.env.OPEN_NEXT_BUILD_ID ?? process.env.DEPLOYMENT_ID;
}

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
            const url = new URL('https://incremental-cache.internal');
            url.searchParams.set('key', key);
            if (cacheType) {
                url.searchParams.set('cacheType', cacheType);
            }
            const buildId = getBuildId(cacheType);
            if (buildId) {
                url.searchParams.set('buildId', buildId);
            }

            const response = await this.getWorker().fetch(new Request(url));
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
            await this.getWorker().set(key, value, cacheType, getBuildId(cacheType));
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
