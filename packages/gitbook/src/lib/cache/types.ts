export interface CacheEntryLookup {
    key: string;
    tag: string;
}

export interface CacheEntryMeta extends CacheEntryLookup {
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
    get(entry: CacheEntryLookup, options?: { signal?: AbortSignal }): Promise<CacheEntry | null>;

    /**
     * Set a value in the cache.
     */
    set(entry: CacheEntry): Promise<void>;

    /**
     * Delete a value from the cache.
     */
    del(keys: CacheEntryLookup[]): Promise<void>;

    /**
     * Revalidate all keys associated with tags.
     * It should return the meta of all entries that were revalidated.
     */
    revalidateTags(tags: string[]): Promise<{ entries: Array<CacheEntryLookup | CacheEntryMeta> }>;
}
