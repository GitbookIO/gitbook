import type { GitBookLinker } from './links';
import { removeTrailingSlash } from './paths';

/**
 * Check if an href points to the current site's auth login route.
 */
export function isSiteAuthLoginHref(
    linker: Pick<GitBookLinker, 'toPathInSite' | 'toAbsoluteURL' | 'toLinkForContent'>,
    href?: string | null
) {
    if (!href) {
        return false;
    }

    const relativeLoginHref = linker.toPathInSite('~gitbook/auth/login');
    const absoluteLoginHref = linker.toAbsoluteURL(relativeLoginHref);
    const siteRelativeHref = URL.canParse(href) ? linker.toLinkForContent(href) : href;

    return (
        normalizeHref(href) === normalizeHref(relativeLoginHref) ||
        normalizeHref(href) === normalizeHref(absoluteLoginHref) ||
        normalizeHref(siteRelativeHref) === normalizeHref(relativeLoginHref)
    );
}

/**
 * Normalize an href so login-route comparisons ignore trailing slashes.
 */
function normalizeHref(href: string) {
    if (URL.canParse(href)) {
        const url = new URL(href);
        return `${url.origin}${removeTrailingSlash(url.pathname)}`;
    }

    return removeTrailingSlash(href);
}
