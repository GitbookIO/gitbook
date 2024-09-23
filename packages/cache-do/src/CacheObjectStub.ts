import type { CacheObject, CacheObjectDescriptor } from './CacheObject';

export type CacheLocationId = ContinentCode;

const allLocations: CacheLocationId[] = ['AF', 'AS', 'NA', 'SA', 'AN', 'EU', 'OC'];

/**
 * Client to access a tag in the cache.
 */
export class CacheObjectStub {
    private opened: CacheObjectDescriptor | null = null;

    constructor(
        private doNamespace: DurableObjectNamespace<CacheObject>,
        private locationId: CacheLocationId,
        private objectId: string,
    ) {}

    /**
     * Open the cache object.
     */
    async open() {
        if (!this.opened) {
            const groupId = getCacheGroupIdName(this.locationId, this.objectId);
            console.log('opening cache group', groupId);
            const cacheGroup = this.doNamespace.get(this.doNamespace.idFromName(groupId));
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
        const desc = await this.open();
        return await desc.set<Value>(key, value, expiresAt);
    }

    /**
     * Purge all keys in the cache tag.
     */
    async purge() {
        await Promise.all(
            allLocations.map((locationId) => {
                const groupId = getCacheGroupIdName(locationId, this.objectId);
                const cacheGroup = this.doNamespace.get(this.doNamespace.idFromName(groupId));
                return cacheGroup.purge();
            }),
        );
    }
}

function getCacheGroupIdName(locationId: CacheLocationId, objectId: string): string {
    return `${locationId}:${objectId}`;
}
