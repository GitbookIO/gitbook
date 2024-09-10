export interface CacheEntryMeta {
    key: string;

    /**
     * Timestamp when the entry was created.
     */
    setAt: number;

    /**
     * Name of the function that was cached.
     */
    cache: string;

    /**
     * Timestamp when the entry expires.
     */
    expiresAt: number;

    /**
     * Timestamp after which the entry should be revalidated.
     */
    revalidatesAt?: number;

    /**
     * Tags associated with the entry, used for revalidation.
     * If no tags is present, the entry is considered immutable.
     */
    tags: string[];

    /**
     * Arguments that were passed to the function.
     */
    args: any[];
}

export interface CacheEntry {
    data: any;
    meta: CacheEntryMeta;
}

export interface CacheBackend {
    name: string;

    /**
     * Define the type of cache and how replication should be managed between them.
     * Value read from local cache will not be replicated to global cache.
     * Value read from global cache will be replicated to local cache.
     */
    replication: 'local' | 'global';

    /**
     * Get a value from the cache.
     */
    get(key: string, options?: { signal?: AbortSignal }): Promise<CacheEntry | null>;

    /**
     * Set a value in the cache.
     */
    set(key: string, entry: CacheEntry): Promise<void>;

    /**
     * Delete a value from the cache.
     */
    del(keys: string[]): Promise<void>;

    /**
     * Revalidate all keys associated with tags.
     * It should return the meta of all entries that were revalidated.
     */
    revalidateTags(tags: string[]): Promise<{ keys: string[]; metas: CacheEntryMeta[] }>;
}
