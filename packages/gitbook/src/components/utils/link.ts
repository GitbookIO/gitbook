/**
 * Check if a link is external, compared to an origin.
 */
export function isExternalLink(href: string, origin: string | null = null) {
    if (!URL.canParse) {
        // If URL.canParse is not available, we quickly check if it looks like a URL
        return href.startsWith('http');
    }

    if (!URL.canParse(href)) {
        // If we can't parse the href, we consider it a relative path
        return false;
    }

    if (!origin) {
        // If origin is not provided, we consider the link external
        return true;
    }

    // If the url points to the same origin, we consider it internal
    const parsed = new URL(href);
    return parsed.origin !== origin;
}
