/**
 * Join path parts and normalize the result.
 */
export function joinPath(...parts: string[]): string {
    return parts.join('/').replace(/\/+/g, '/');
}

/**
 * Remove the trailing slash from a path.
 */
export function removeTrailingSlash(path: string): string {
    return path.replace(/\/+$/, '');
}

/**
 * Remove the leading slash from a path.
 */
export function removeLeadingSlash(path: string): string {
    return path.replace(/^\/+/, '');
}
