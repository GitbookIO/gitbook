import { withTrailingSlash } from '@/lib/paths';
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
 * Return a site-relative href if `url` points within the current site, otherwise `null`.
 *
 * Unlike a bare same-origin check, this enforces the site base path, so an assistant cannot
 * navigate the reader to another page on the same host (e.g. a marketing page, or a different
 * docs site sharing the host such as `gitbook.com/other` or another `/url/...` proxied site).
 */
export function toInSiteHref(
    url: string,
    linker: { toLinkForContent: (url: string) => string; siteBasePath: string }
): string | null {
    if (URL.canParse(url)) {
        // toLinkForContent returns a site-relative path for in-site URLs (matching host AND site
        // base path), or the raw absolute URL otherwise.
        const link = linker.toLinkForContent(url);
        return URL.canParse(link) ? null : link;
    }

    // Relative path: it must live under the site base path.
    let pathname: string;
    let rest = '';
    try {
        const parsed = new URL(url, 'https://navigation.invalid');
        pathname = parsed.pathname;
        rest = `${parsed.search}${parsed.hash}`;
    } catch {
        return null;
    }
    return withTrailingSlash(pathname).startsWith(linker.siteBasePath)
        ? `${pathname}${rest}`
        : null;
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
