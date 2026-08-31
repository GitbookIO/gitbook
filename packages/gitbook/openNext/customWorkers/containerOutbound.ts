import type {
    CacheEntryType,
    CacheValue,
    NextModeTagCacheWriteInput,
    QueueMessage,
} from '@opennextjs/aws/types/overrides.js';

import {
    CACHE_PATH,
    type DeletePayload,
    type QueuePayload,
    type SetPayload,
    type WriteTagsPayload,
} from '../container/protocol';

export type CacheWorkerBinding = {
    fetch(request: Request): Promise<Response>;
    set<CacheType extends CacheEntryType>(
        key: string,
        value: CacheValue<CacheType>,
        cacheType?: CacheType
    ): Promise<void>;
    delete(key: string): Promise<void>;
    writeTags(tags: NextModeTagCacheWriteInput[]): Promise<void>;
    enqueueRevalidation(msg: QueueMessage): Promise<void>;
};

export type ContainerOutboundEnv = {
    NEXT_INC_CACHE_WORKER: CacheWorkerBinding;
};

const noContent = (): Response => new Response(null, { status: 204 });

/**
 * Handles the requests the container makes to the virtual cache host. It runs in the Workers
 * runtime, so it can reach the cache worker through the service binding the container cannot see.
 */
export async function handleCacheOutbound(
    request: Request,
    env: ContainerOutboundEnv
): Promise<Response> {
    const worker = env.NEXT_INC_CACHE_WORKER;
    if (!worker) {
        console.error('Missing NEXT_INC_CACHE_WORKER service binding');
        return new Response('Cache worker unavailable', { status: 503 });
    }

    const url = new URL(request.url);

    try {
        switch (url.pathname) {
            case CACHE_PATH.read: {
                // Rebuild the request the workerd tier sends, down to the scheme, so both tiers
                // share one entry in the cache worker's edge cache.
                url.protocol = 'https:';
                return await worker.fetch(new Request(url));
            }
            case CACHE_PATH.set: {
                const { key, value, cacheType } = (await request.json()) as SetPayload;
                await worker.set(key, value, cacheType);
                return noContent();
            }
            case CACHE_PATH.delete: {
                const { key } = (await request.json()) as DeletePayload;
                await worker.delete(key);
                return noContent();
            }
            case CACHE_PATH.writeTags: {
                const { tags } = (await request.json()) as WriteTagsPayload;
                await worker.writeTags(tags);
                return noContent();
            }
            case CACHE_PATH.queue: {
                const { msg } = (await request.json()) as QueuePayload;
                await worker.enqueueRevalidation(msg);
                return noContent();
            }
            default:
                return new Response('Not found', { status: 404 });
        }
    } catch (error) {
        console.error('Cache outbound handler failed', url.pathname, error);
        return new Response('Cache worker error', { status: 502 });
    }
}
