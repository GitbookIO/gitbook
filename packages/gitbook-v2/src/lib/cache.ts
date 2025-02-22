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
