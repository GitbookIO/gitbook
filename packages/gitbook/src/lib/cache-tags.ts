/**
 * Cache tags emitted while rendering the PPR route are prefixed, so that PPR cache entries
 * live in their own namespace and are invalidated independently from the static ones.
 */
export const PPR_CACHE_TAG_PREFIX = 'ppr:';

/**
 * Prefix cache tags when rendering under the PPR route, leave them untouched otherwise.
 */
export function prefixCacheTags(tags: string[], ppr: boolean | undefined): string[] {
    return ppr ? tags.map((tag) => `${PPR_CACHE_TAG_PREFIX}${tag}`) : tags;
}
