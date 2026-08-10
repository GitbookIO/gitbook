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
 * Return the encoded anchor when a URL points to the current page.
 */
export function getSamePageAnchor(input: string, location: Pick<Location, 'href'>): string | null {
    const currentURL = new URL(location.href);
    const targetURL = new URL(input, currentURL);

    if (
        targetURL.origin !== currentURL.origin ||
        targetURL.pathname !== currentURL.pathname ||
        targetURL.search !== currentURL.search ||
        !targetURL.hash
    ) {
        return null;
    }

    return targetURL.hash.slice(1);
}

/**
 * Resolve a hash-only anchor against a location while replacing any existing hash.
 */
export function resolveAnchorURL(anchor: string, location: Pick<Location, 'href'>): string {
    const url = new URL(location.href);
    url.hash = anchor;
    return `${url.pathname}${url.search}${url.hash}`;
}
