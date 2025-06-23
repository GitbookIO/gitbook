import type {
    CacheEntryType,
    CacheValue,
    IncrementalCache,
    WithLastModified,
} from '@opennextjs/aws/types/overrides';

export default {
    get: async <CacheType extends CacheEntryType = 'cache'>(
        key: string,
        cacheType?: CacheType
    ): Promise<WithLastModified<CacheValue<CacheType>> | null> => {
        console.log(`NoOpCache: get called for key: ${key}, cacheType: ${cacheType}`);
        const resp = await fetch(`http://${process.env.HOST || 'localhost:8771'}/_internal/get`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, cacheType }),
        });
        console.log(`NoOpCache: get response for key: ${key}, cacheType: ${cacheType}`, resp.status);
        return resp.ok ? resp.json() : null;
    },
    set: async <CacheType extends CacheEntryType = 'cache'>(
        key: string,
        value: CacheValue<CacheType>,
        cacheType?: CacheType
    ): Promise<void> => {
        console.log(`NoOpCache: set called for key: ${key}, cacheType: ${cacheType}`);
        await fetch(`http://${process.env.HOST || 'localhost:8771'}/_internal/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key, value, cacheType }),
        });
    },
    delete: (_key: string): Promise<void> => {
        return Promise.resolve();
    },
    name: '',
} satisfies IncrementalCache;
