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
    /**
     * Get a value from the cache.
     */
    get(key: string): Promise<CacheEntry | null>;

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
