import { withTrailingSlash } from '@/lib/paths';

/**
 * Check if a link is external, compared to an origin.
 */
export function isExternalLink(href: string, origin: string | null = null) {
    // Anchor links are not external
    if (href.startsWith('#')) {
        return false;
    }

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

    // If the url points to the same origin, we consider it internal,
    // a proxy origin can be "gitbook.com/docs", so we also check the pathname.
    const parsed = new URL(href);
    const originUrl = new URL(origin);

    // Compare origins exactly first
    if (parsed.origin !== originUrl.origin) {
        return true;
    }

    // Compare pathname exactly
    if (parsed.pathname === originUrl.pathname) {
        return false;
    }

    // Then compare the pathname by adding "/" to ensure we don't match "gitbook.com/docs-x"
    return !parsed.pathname.startsWith(withTrailingSlash(originUrl.pathname));
}

/**
 * Remove "~gitbook/embed/page" or "~gitbook/embed" in the link.
 */
export function toNonEmbedLink(href: string) {
    return href.replace(/~gitbook\/embed(\/page)?\/?/, '');
}

/**
 * Check if a link points to the site's `~gitbook/auth/login` or `~gitbook/auth/logout` route.
 *
 * Deliberately loose: these routes only exist at the site root, but the site's base path isn't
 * known here, so any prefix matches. A false positive only costs the link its prefetch.
 */
export function isSiteAuthLink(href: string) {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    if (!URL.canParse?.(href, baseURL)) {
        return false;
    }

    return /\/~gitbook\/auth\/(login|logout)\/?$/.test(new URL(href, baseURL).pathname);
}
