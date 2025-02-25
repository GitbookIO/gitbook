/**
 * Get the cache tag for a site.
 */
export function getSiteCacheTag(siteId: string) {
    return `sites/${siteId}`;
}

/**
 * Get the cache tag for a hostname.
 */
export function getHostnameCacheTag(hostname: string) {
    return `hostnames/${hostname}`;
}

/**
 * Get the cache tag for an OpenAPI spec.
 */
export function getOpenAPISpecCacheTag(organizationId: string, slug: string) {
    return `organizations/${organizationId}/openapis/${slug}`;
}

/**
 * Get the cache tag for a space.
 */
export function getSpaceCacheTag(spaceId: string) {
    return `spaces/${spaceId}`;
}

/**
 * Get the cache tag for a change request.
 */
export function getChangeRequestCacheTag(spaceId: string, changeRequestId: string) {
    return `spaces/${spaceId}/change-requests/${changeRequestId}`;
}
