import { trace } from '@/lib/tracing';
import type { DurableObjectLocationHint } from '@cloudflare/workers-types';
import { generateShardId } from '@opennextjs/aws/core/routing/queue.js';
import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { softTagFilter } from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter';

export const DEFAULT_REGION = 'enam';
//TODO: We may not need all these regions.
export const AVAILABLE_REGIONS = [
    'enam',
    'weur',
    'apac',
    'sam',
    'afr',
    'oc',
] as DurableObjectLocationHint[];

/**
 * - `change-request` are only used by preview urls. One DO per region and space
 * - `internal` are used for the release tag and integrations which does not depend on the user
 * - `global` are used for url and site tag
 * - `space` are only used the space tag (i.e. when a CR is merged)
 * - `organization` are used for translation and openAPI. One DO per region and organization
 */
type TagType = 'change-request' | 'internal' | 'global' | 'space' | 'organization';

interface DOIdOptions {
    baseShardId: string;
    numberOfReplicas: number;
    shardType: TagType;
    replicaId?: number;
    region?: DurableObjectLocationHint;
    tag: string;
}

interface CacheTagKeyOptions {
    doId: DOId;
    tags: string[];
}

export class DOId {
    options;
    shardId;
    replicaId;
    region;
    constructor(options: DOIdOptions) {
        this.options = options;
        const { baseShardId, shardType, numberOfReplicas, replicaId, region } = options;
        this.shardId = `tag-${shardType};${baseShardId}`;
        this.replicaId = replicaId ?? this.generateRandomNumberBetween(1, numberOfReplicas);
        this.region = region;
    }
    generateRandomNumberBetween(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    get key() {
        // For those 2 type of tags, we likely don't need any kind of replication or even sharding
        // We may reconsider it for `change-request` at some point
        if (this.options.shardType === 'organization') {
            const organization = this.options.tag.split(':')[1];
            return `${this.shardId};region-${this.region};org:${organization}`;
        }
        if (this.options.shardType === 'change-request') {
            const space = this.options.tag.split(':')[1];
            return `${this.shardId};region-${this.region};space:${space}`;
        }
        return `${this.shardId};replica-${this.replicaId}${this.region ? `;region-${this.region}` : ''}`;
    }
}

class GitbookTagCache implements NextModeTagCache {
    localCache: Cache | undefined;
    maxWriteRetries = 3;
    constructor(
        private config: {
            numberOfShards: Record<TagType, number>;
            numberOfReplicas: Record<TagType, number>;
            ttl: Record<TagType, number>;
        }
    ) {}

    name = 'GitbookTagCache';
    mode = 'nextMode' as const;

    // This one is only used for soft tags, no need to do anything for us
    async getLastRevalidated(_tags: string[]) {
        return 0;
    }

    getDurableObjectStub(doId: DOId) {
        const durableObject = getCloudflareContext().env.NEXT_TAG_CACHE_DO_SHARDED;
        if (!durableObject) throw new Error('No durable object binding for cache revalidation');
        const id = durableObject.idFromName(doId.key);
        return durableObject.get(id, { locationHint: doId.region });
    }

    async hasBeenRevalidated(tags: string[], lastModified?: number) {
        const tagsToCheck = tags.filter(softTagFilter);
        if (tagsToCheck.length === 0) {
            // If we reach here, it probably means that there is an issue that we'll need to address.
            console.warn(
                'hasBeenRevalidated - No valid tags to check for revalidation, original tags:',
                tags
            );
            return false; // If no tags to check, return false
        }
        return trace(
            {
                operation: 'gitbookTagCacheHasBeenRevalidated',
                name: tagsToCheck.join(', '),
            },
            async () => {
                const shardedTagGroups = this.groupTagsByDO({ tags });
                const shardedTagRevalidationOutcomes = await Promise.all(
                    shardedTagGroups.map(async ({ doId, tags }) => {
                        const cachedValue = await this.getFromRegionalCache({
                            doId,
                            tags,
                        });
                        if (cachedValue) {
                            return (await cachedValue.text()) === 'true';
                        }
                        const stub = this.getDurableObjectStub(doId);
                        const _hasBeenRevalidated = await stub.hasBeenRevalidated(
                            tags,
                            lastModified
                        );
                        //TODO: Do we want to cache the result if it has been revalidated ?
                        // If we do so, we risk causing cache MISS even though it has been revalidated elsewhere
                        // On the other hand revalidating a tag that is used in a lot of places will cause a lot of requests
                        if (!_hasBeenRevalidated) {
                            getCloudflareContext().ctx.waitUntil(
                                this.putToRegionalCache({ doId, tags }, _hasBeenRevalidated)
                            );
                        }
                        return _hasBeenRevalidated;
                    })
                );
                return shardedTagRevalidationOutcomes.some((result) => result);
            }
        );
    }

    async writeTags(tags: string[]) {
        return trace(
            {
                operation: 'gitbookTagCacheWriteTags',
                name: tags.join(', '),
            },
            async () => {
                const tagsToWrite = tags.filter(softTagFilter);
                if (tagsToWrite.length === 0) {
                    console.warn('writeTags - No valid tags to write');
                    return; // If no tags to write, exit early
                }
                // Write only the filtered tags
                const shardedTagGroups = this.groupTagsByDO({
                    tags: tagsToWrite,
                });
                // We want to use the same revalidation time for all tags
                const currentTime = Date.now();
                await Promise.all(
                    shardedTagGroups.map(async ({ doId, tags }) => {
                        await this.performWriteTagsWithRetry(doId, tags, currentTime);
                    })
                );
            }
        );
    }

    async performWriteTagsWithRetry(
        doId: DOId,
        tags: string[],
        lastModified: number,
        retryNumber = 0
    ) {
        try {
            const stub = this.getDurableObjectStub(doId);
            await stub.writeTags(tags, lastModified);
            // Depending on the shards and the tags, deleting from the regional cache will not work for every tag
            // We also need to delete both cache
            await Promise.all([this.deleteRegionalCache({ doId, tags })]);
        } catch (e) {
            if (retryNumber >= this.maxWriteRetries) {
                console.error('Error while writing tags, too many retries', e);
                // Do we want to throw an error here ?
                await getCloudflareContext().env.NEXT_TAG_CACHE_DO_SHARDED_DLQ?.send({
                    failingShardId: doId.key,
                    failingTags: tags,
                    lastModified,
                });
                return;
            }
            await this.performWriteTagsWithRetry(doId, tags, lastModified, retryNumber + 1);
        }
    }

    /**
     * Same tags are guaranteed to be in the same shard
     * @param tags
     * @returns An array of DO ids and tags
     */
    groupTagsByDO({ tags }: { tags: string[] }) {
        const crTags = this.generateDOIdArray({ tags, shardType: 'change-request' });
        const spaceTags = this.generateDOIdArray({ tags, shardType: 'space' });
        const internalTags = this.generateDOIdArray({ tags, shardType: 'internal' });
        const globalTags = this.generateDOIdArray({ tags, shardType: 'global' });
        const orgTags = this.generateDOIdArray({ tags, shardType: 'organization' });
        const tagIdCollection = [
            ...crTags,
            ...spaceTags,
            ...internalTags,
            ...globalTags,
            ...orgTags,
        ];
        // We then group the tags by DO id
        const tagsByDOId = new Map<string, { doId: DOId; tags: string[] }>();
        for (const { doId, tag } of tagIdCollection) {
            const doIdString = doId.key;
            const tagsArray = tagsByDOId.get(doIdString)?.tags ?? [];
            tagsArray.push(tag);
            tagsByDOId.set(doIdString, {
                // We override the doId here, but it should be the same for all tags
                doId,
                tags: tagsArray,
            });
        }
        const result = Array.from(tagsByDOId.values());
        return result;
    }

    /**
     * Generates a list of DO ids for the shards and replicas
     * @param tags The tags to generate shards for
     * @param shardType The type of the shard (change-request, internal, global, space)
     * @returns An array of TagCacheDOId and tag
     */
    generateDOIdArray({
        tags,
        shardType,
    }: {
        tags: string[];
        shardType: TagType;
    }) {
        const numReplicas = this.config.numberOfReplicas[shardType];
        const replicaIndexes = Array.from({ length: numReplicas }, (_, i) => i + 1);

        const regionalReplicas = replicaIndexes.flatMap((replicaId) => {
            return tags
                .filter((tag) => this.getTagType(tag) === shardType)
                .map((tag) => {
                    return {
                        doId: new DOId({
                            baseShardId: generateShardId(
                                tag,
                                this.config.numberOfShards[shardType],
                                'shard'
                            ),
                            numberOfReplicas: numReplicas,
                            shardType,
                            replicaId,
                            tag,
                        }),
                        tag,
                    };
                });
        });
        // If we have regional replication enabled, we need to further duplicate the shards in all the regions
        const regionalReplicasInAllRegions = regionalReplicas.flatMap(({ doId, tag }) => {
            return AVAILABLE_REGIONS.map((region) => {
                return {
                    doId: new DOId({
                        baseShardId: doId.options.baseShardId,
                        numberOfReplicas: numReplicas,
                        shardType,
                        replicaId: doId.replicaId,
                        region,
                        tag,
                    }),
                    tag,
                };
            });
        });
        return regionalReplicasInAllRegions;
    }

    getTagType(tag: string): TagType {
        if (tag.includes('change-request:')) {
            return 'change-request';
        }
        if (tag.startsWith('release:') || tag.startsWith('integration:')) {
            // Maybe use platform instead of internal ??
            return 'internal';
        }
        if (tag.startsWith('site:') || tag.startsWith('url:')) {
            // TODO: find a better name here.
            // BTW do we want to append something like the organization to these cache tag
            return 'global';
        }
        if (tag.startsWith('organization:')) {
            return 'organization';
        }
        return 'space';
    }

    /**
     *
     * @returns The closest region to the user, if not found we default to "enam"
     */
    getClosestRegion() {
        const continent = getCloudflareContext().cf?.continent;
        if (!continent) return 'enam';
        switch (continent) {
            case 'AF':
                return 'afr';
            case 'AS':
                return 'apac';
            case 'EU':
                return 'weur';
            case 'NA':
                return 'enam';
            case 'OC':
                return 'oc';
            case 'SA':
                return 'sam';
            default:
                return 'enam';
        }
    }

    // Cache API
    async getCacheInstance() {
        if (!this.localCache) {
            this.localCache = await caches.open('sharded-do-tag-cache');
        }
        return this.localCache;
    }
    getCacheUrlKey(opts: CacheTagKeyOptions) {
        const { doId, tags } = opts;
        return `http://local.cache/shard/${doId.shardId}?tags=${encodeURIComponent(tags.join(';'))}`;
    }
    async getFromRegionalCache(opts: CacheTagKeyOptions) {
        try {
            const cache = await this.getCacheInstance();
            if (!cache) return;
            return cache.match(this.getCacheUrlKey(opts));
        } catch (e) {
            console.error('Error while fetching from regional cache', e);
        }
    }
    async putToRegionalCache(optsKey: CacheTagKeyOptions, value: boolean) {
        const cache = await this.getCacheInstance();
        if (!cache) return;
        const tags = optsKey.tags;
        await cache.put(
            this.getCacheUrlKey(optsKey),
            new Response(`${value}`, {
                headers: {
                    'cache-control': `max-age=${this.config.ttl[optsKey.doId.options.shardType] ?? 5}`,
                    ...(tags.length > 0
                        ? {
                              'cache-tag': tags.join(','),
                          }
                        : {}),
                },
            })
        );
    }
    async deleteRegionalCache(optsKey: CacheTagKeyOptions) {
        // We never want to crash because of the cache
        try {
            const cache = await this.getCacheInstance();
            if (!cache) return;
            await cache.delete(this.getCacheUrlKey(optsKey));
        } catch (e) {
            console.warn(e);
        }
    }
}

export default new GitbookTagCache({
    numberOfShards: {
        'change-request': 1,
        global: 10,
        internal: 10,
        space: 10,
        organization: 1,
    },
    numberOfReplicas: {
        'change-request': 1,
        global: 2,
        internal: 2,
        space: 1,
        organization: 1,
    },
    ttl: {
        'change-request': 60,
        global: 3600,
        internal: 86400,
        space: 3600,
        organization: 86400,
    },
});
