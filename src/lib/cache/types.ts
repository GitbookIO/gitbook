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

    /**
     * Number of hits on this entry.
     */
    hits: number;
}

export interface CacheEntry {
    data: any;
    meta: CacheEntryMeta;
}

export interface CacheBackend {
    name: string;

    /**
     * If true, we'll set entries in this cache that have been found in another cache.
     */
    fallback?: boolean;

    /**
     * Get a value from the cache.
     */
    get(key: string, options?: { signal?: AbortSignal }): Promise<CacheEntry | null>;

    /**
     * Set a value in the cache.
     */
    set(key: string, entry: CacheEntry): Promise<void>;

    /**
     * Revalidate all keys associated with tags.
     * It should return the meta of all entries that were revalidated.
     */
    revalidateTags(tags: string[]): Promise<CacheEntryMeta[]>;
}
