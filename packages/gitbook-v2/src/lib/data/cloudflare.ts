import assertNever from 'assert-never';
import hash from 'object-hash';

type CacheProfile = 'days' | 'weeks' | 'max';

/**
 * Get the parameters for the Cloudflare cache to pass to an outgoing request.
 * This approach is designed to optimize performances when GitBook Open is running on Cloudflare.
 */
export function getCloudflareRequestCache({
    operationId,
    contextId,
    cacheInput,
    cacheTags,
    cacheProfile,
}: {
    /** ID of the API operation. */
    operationId: string;
    /** Identifier for the authentication context. This is passed when getting an auth token. */
    contextId: string | undefined;
    /** Input of the API operation. */
    cacheInput: Record<string, any>;
    /** Tags to add to the cache. */
    cacheTags: string[];
    /** Cache profile to use. */
    cacheProfile?: CacheProfile;
}): RequestInit['cf'] {
    return {
        cacheEverything: true,
        cacheTags: cacheTags,
        cacheKey: `open:${operationId}:${contextId}:${hash(cacheInput)}`,
        cacheTtl: cacheProfile ? getCacheTtl(cacheProfile) : undefined,
    };
}

/**
 * https://nextjs.org/docs/app/api-reference/functions/cacheLife#default-cache-profiles
 */
function getCacheTtl(profile: CacheProfile) {
    switch (profile) {
        case 'days':
            // Expires after 1 week
            return 7 * 24 * 60 * 60;
        case 'max':
        case 'weeks':
            // Expires after 1 month
            return 30 * 24 * 60 * 60;
        default:
            assertNever(profile);
    }
}
