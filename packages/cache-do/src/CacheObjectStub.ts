import type { CacheObject, CacheObjectDescriptor } from './CacheObject';

export type CacheLocationId = ContinentCode;
const allLocations: CacheLocationId[] = ['AF', 'AS', 'NA', 'SA', 'AN', 'EU', 'OC'];

/**
 * Location hint for the CacheObject durable object.
 */
const doLocationHints: {
    [key in CacheLocationId]: DurableObjectLocationHint;
} = {
    AF: 'afr',
    AS: 'apac',
    NA: 'wnam',
    SA: 'sam',
    AN: 'oc',
    EU: 'weur',
    OC: 'oc',
};

/**
 * Client to access a cache tag.
 */
export class CacheObjectStub {
    private stub: DurableObjectStub<CacheObject>;

    constructor(
        /** Binding to the CacheObject durable object */
        private doNamespace: DurableObjectNamespace<CacheObject>,
        /** ID of the location to target */
        private locationId: CacheLocationId,
        /** Name of the tag */
        private tag: string,
    ) {
        const groupId = getCacheObjectIdName(this.locationId, this.tag);
        this.stub = this.doNamespace.get(this.doNamespace.idFromName(groupId), {
            // Initialize the object with a locaiton hint,
            // as we might want to purge all locations before the object is created.
            // https://developers.cloudflare.com/durable-objects/reference/data-location/
            locationHint: doLocationHints[this.locationId],
        });
    }

    /**
     * Open a descriptor to the cache object.
     * It can be used to perform multiple operations in a single RPC session.
     * Ex:
     * ```ts
     * using desc = cache.open();
     * await desc.set('key', 'value', Date.now() + 1000);
     * await desc.get('key');
     * ```
     */
    async open() {
        return await this.stub.open();
    }

    /**
     * Get a value from the cache.
     */
    async get<Value = unknown>(key: string) {
        return (await this.stub.get(key)) as Value | undefined;
    }

    /**
     * Set a value in the cache.
     */
    async set<Value = unknown>(key: string, value: Value, expiresAt: number) {
        return await this.stub.set(key, value, expiresAt);
    }

    /**
     * Purge all keys in the cache tag.
     */
    async purge() {
        const keys = new Set<string>();
        await Promise.all(
            allLocations.map(async (locationId) => {
                const groupId = getCacheObjectIdName(locationId, this.tag);
                const cacheGroup = this.doNamespace.get(this.doNamespace.idFromName(groupId));
                const locationkeys = await cacheGroup.purge();
                locationkeys.forEach((key) => keys.add(key));
            }),
        );

        return keys;
    }
}

function getCacheObjectIdName(locationId: CacheLocationId, tag: string): string {
    return `${locationId}:${tag}`;
}
