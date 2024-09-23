import type { CacheObject, CacheObjectDescriptor } from "./CacheObject";

type CacheLocationId = ContinentCode;

const allLocations: CacheLocationId[] = [
    "AF", "AS", "NA", "SA", "AN", "EU", "OC"
];

/**
 * Client to access a tag in the cache.
 */
export class CacheObjectStub {
    private opened: CacheObjectDescriptor | null = null;

    constructor(
        private doNamespace: DurableObjectNamespace<CacheObject>,
        private locationId: CacheLocationId,
        private objectId: string
    ) {

    }

    /**
     * Open the cache object.
     */
    async open() {
        if (!this.opened) {
            const groupId = getCacheGroupIdName(this.locationId, this.objectId);
            const cacheGroup = this.doNamespace.get(this.doNamespace.idFromName(groupId));
            this.opened = await cacheGroup.open();
        }

        return this.opened;
    }

    /**
     * Get a value from the cache.
     */
    async get(key: string) {
        const desc = await this.open();
        return await desc.get(key);
    }

    /**
     * Set a value in the cache.
     */
    async set(key: string, value: any) {
        const desc = await this.open();
        return await desc.set(key, value);
    }

    /**
     * Purge all keys in the cache tag.
     */
    async purge() {
        await Promise.all(
            allLocations.map(locationId => {
                const groupId = getCacheGroupIdName(locationId, this.objectId);
                const cacheGroup = this.doNamespace.get(this.doNamespace.idFromName(groupId));
                return cacheGroup.purge();
            })
        );
    }
}

function getCacheGroupIdName(
    locationId: CacheLocationId,
    objectId: string
): string {
    return `${locationId}:${objectId}`;
}
