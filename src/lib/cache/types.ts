export interface CacheEntryMeta {
    /**
     * Name of the function that was cached.
     */
    cache: string;

    /**
     * When the entry expires.
     */
    expiresAt: number;

    /**
     * Tags associated with the entry.
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
    revalidateTags(
        tags: string[],
        purge: boolean,
    ): Promise<{ keys: string[]; metas: CacheEntryMeta[] }>;
}
