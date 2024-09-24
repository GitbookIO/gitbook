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
    private opened: CacheObjectDescriptor | null = null;

    constructor(
        /** Binding to the CacheObject durable object */
        private doNamespace: DurableObjectNamespace<CacheObject>,
        /** ID of the location to target */
        private locationId: CacheLocationId,
        /** Name of the tag */
        private tag: string,
    ) {}

    /**
     * Open the cache object.
     */
    async open() {
        if (!this.opened) {
            const groupId = getCacheObjectIdName(this.locationId, this.tag);
            const cacheGroup = this.doNamespace.get(this.doNamespace.idFromName(groupId), {
                // Initialize the object with a locaiton hint,
                // as we might want to purge all locations before the object is created.
                // https://developers.cloudflare.com/durable-objects/reference/data-location/
                locationHint: doLocationHints[this.locationId],
            });
            this.opened = await cacheGroup.open();
        }

        return this.opened;
    }

    /**
     * Get a value from the cache.
     */
    async get<Value = unknown>(key: string) {
        const desc = await this.open();
        return await desc.get<Value>(key);
    }

    /**
     * Set a value in the cache.
     */
    async set<Value = unknown>(key: string, value: Value, expiresAt: number) {
        // TODO: Should we write on all locations instead of just the current one?
        const desc = await this.open();
        return await desc.set<Value>(key, value, expiresAt);
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
