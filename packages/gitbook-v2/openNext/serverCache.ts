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
        try {
            const resp = await fetch(
                `http://${process.env.HOST || 'localhost:8771'}/_internal/get`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ key, cacheType }),
                }
            );
            return resp.ok ? resp.json() : null;
        } catch (e) {
            console.error('Error fetching cache:', e);
            return null;
        }
    },
    set: async <CacheType extends CacheEntryType = 'cache'>(
        key: string,
        value: CacheValue<CacheType>,
        cacheType?: CacheType
    ): Promise<void> => {
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
    name: 'ServerContainerCache',
} satisfies IncrementalCache;
