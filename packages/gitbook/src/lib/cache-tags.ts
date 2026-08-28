/**
 * Cache tags emitted while rendering the PPR route are prefixed, so that PPR cache entries
 * live in their own namespace and are invalidated independently from the static ones.
 */
export const PPR_CACHE_TAG_PREFIX = 'ppr:';

/**
 * Independently revalidatable units of the PPR route. The scope is part of the cache key of the
 * data fetchers, so each component owns its own copy of the data it reads.
 */
export type PPRCacheScope = 'header' | 'toc' | 'body';

/**
 * Scope every cache tag emitted while rendering a PPR component, so the component and the data it
 * depends on are invalidated as one unit. Tags are left untouched outside the PPR route.
 */
export function scopeCacheTags(tags: string[], scope: PPRCacheScope | undefined): string[] {
    return scope ? tags.map((tag) => `${PPR_CACHE_TAG_PREFIX}${scope}:${tag}`) : tags;
}
