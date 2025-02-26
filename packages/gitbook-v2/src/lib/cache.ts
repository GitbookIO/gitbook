/**
 * Get the cache tag for a site.
 */
export function getSiteCacheTag(siteId: string) {
    return `site:${siteId}`;
}

/**
 * Get the cache tag for a hostname.
 */
export function getHostnameCacheTag(hostname: string) {
    return `url:${hostname}`;
}

/**
 * Get the cache tag for an OpenAPI spec.
 */
export function getOpenAPISpecCacheTag(organizationId: string, slug: string) {
    return `organization:${organizationId}:openapi:${slug}`;
}

/**
 * Get the cache tag for a space.
 */
export function getSpaceCacheTag(spaceId: string) {
    return `space:${spaceId}`;
}

/**
 * Get the cache tag for a change request.
 */
export function getChangeRequestCacheTag(spaceId: string, changeRequestId: string) {
    return `space:${spaceId}:change-request:${changeRequestId}`;
}
