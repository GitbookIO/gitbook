/**
 * Check if a URL is an HTTP URL.
 */
export function checkIsHttpURL(input: string | URL): boolean {
    if (!URL.canParse(input)) {
        return false;
    }
    const parsed = new URL(input);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

/**
 * True for absolute URLs (`scheme:*`) or hash-only anchors.
 */
export function checkIsExternalURL(input: string): boolean {
    return URL.canParse(input);
}

/**
 * True for a hash-only anchor.
 */
export function checkIsAnchor(input: string): boolean {
    return input.startsWith('#');
}

/**
 * Resolve a hash-only anchor against a location while replacing any existing hash.
 */
export function resolveAnchorURL(anchor: string, location: Pick<Location, 'href'>): string {
    const url = new URL(location.href);
    url.hash = anchor;
    return `${url.pathname}${url.search}${url.hash}`;
}
