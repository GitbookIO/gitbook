import { isExternalLink } from '../utils/link';

/**
 * Resolve a link into a same-site target to navigate to.
 *
 * Returns an `error` when the URL is malformed or points outside of the documentation site,
 * so the assistant can be told it could not navigate.
 */
export function resolveNavigationTarget(
    url: string,
    location: { href: string; origin: string }
): { href: string; pathname: string } | { error: string } {
    let target: URL;
    try {
        target = new URL(url, location.href);
    } catch {
        return { error: `Invalid URL: ${url}` };
    }

    // Only allow navigating within the current documentation site to avoid sending the user to
    // an external website without their consent.
    if (isExternalLink(target.href, location.origin)) {
        return { error: 'Cannot navigate to a page outside of this documentation site.' };
    }

    return { href: `${target.pathname}${target.search}${target.hash}`, pathname: target.pathname };
}

/**
 * Normalize a pathname so two equivalent paths compare equal regardless of percent-encoding or a
 * trailing slash (e.g. `/h%C3%A9llo/` and `/héllo`). Used to detect when an SPA navigation has
 * committed by comparing against `window.location.pathname`.
 */
export function normalizePathname(pathname: string): string {
    let decoded = pathname;
    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        // Keep the raw value if it isn't valid percent-encoding.
    }
    return decoded.length > 1 && decoded.endsWith('/') ? decoded.slice(0, -1) : decoded;
}
