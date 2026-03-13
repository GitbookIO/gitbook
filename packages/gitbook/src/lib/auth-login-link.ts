import type { GitBookLinker } from './links';
import { removeTrailingSlash } from './paths';

/**
 * Check if an href points to the current site's auth login route.
 */
export function isSiteAuthLoginHref(
    linker: Pick<GitBookLinker, 'toPathInSite' | 'toAbsoluteURL'>,
    href?: string | null
) {
    if (!href) {
        return false;
    }

    const relativeLoginHref = linker.toPathInSite('~gitbook/auth/login');
    const absoluteLoginHref = linker.toAbsoluteURL(relativeLoginHref);

    return (
        normalizeHref(href) === normalizeHref(relativeLoginHref) ||
        normalizeHref(href) === normalizeHref(absoluteLoginHref)
    );
}

function normalizeHref(href: string) {
    if (URL.canParse(href)) {
        const url = new URL(href);
        return `${url.origin}${removeTrailingSlash(url.pathname)}`;
    }

    return removeTrailingSlash(href);
}
