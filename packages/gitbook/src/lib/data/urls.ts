import { joinPath, removeTrailingSlash } from '../paths';
import { isProxyRootRequest } from '../proxy';
import { DataFetcherError, getExposableError } from './errors';

/**
 * Paths served by our own routes rather than by site content. They can never be part of a
 * site URL, so a revision or change marker is never searched for inside them.
 * Kept in sync with the site route handlers and `encodePathInSiteContent` in the middleware.
 */
const INTERNAL_PATHS = [
    // Simple `~gitbook` endpoints. `image`, `__evt` and `visitor` are served by the middleware
    // before the lookup, but are listed so this stays a complete registry.
    /^~gitbook\/(pdf|search|icon|site-index|image|__evt|visitor)$/,
    /^~gitbook\/ogimage\/[^/]+$/,
    /^~gitbook\/auth\/(login|logout)$/,
    /^~gitbook\/oauth2\/v1\/[^/]+\/authorize$/,
    /^~gitbook\/embed(\/(assistant|search|demo|script\.js|page(\/.*)?))?$/,
    /^~gitbook\/markdown\/.+$/,
    /^~gitbook\/markdown-ask\/[^/]+(\/[^/]+)?$/,
    /^~gitbook\/rss\/.+$/,
    // Site root files, including the `llms.txt` aliases from `PATH_ALIASES`.
    /^llms\.txt$/,
    /^llms-full\.txt(\/\d+)?$/,
    /^(\.well-known\/)?sitemap\.md$/,
    /^robots\.txt$/,
    /^sitemap(-pages)?\.xml$/,
    /^rss\.xml$/,
];

/**
 * Return the leading segments that can be part of the site URL, dropping the internal path
 * (if any) that follows them.
 */
function getContentPathSegments(pathSegments: string[]): string[] {
    for (let index = 0; index < pathSegments.length; index++) {
        const remaining = pathSegments.slice(index).join('/');
        if (INTERNAL_PATHS.some((regex) => regex.test(remaining))) {
            return pathSegments.slice(0, index);
        }
    }

    return pathSegments;
}

/**
 * For a given GitBook URL, return the URL to resolve with the API.
 *
 * The full URL is resolved as-is, except for revisions and changes in the path
 * (`~/revisions/<id>/` or `~/changes/<id>/`): these are resolved up to the tilde,
 * and the rest of the path goes in the extraPath.
 *
 * Returns `null` for the root proxy URLs, which can never resolve to a site.
 */
export function getURLLookup(input: URL): {
    url: string;
    extraPath: string;
    basePath?: string;
    changeRequest?: string;
    revision?: string;
} | null {
    const url = normalizeURL(input);

    const pathSegments = url.pathname.slice(1).split('/');
    // A `~` in an internal path (like `~gitbook/...`) is not a revision or change marker.
    const contentSegments = getContentPathSegments(pathSegments);
    const tildeIndex = contentSegments.indexOf('~');
    const kind = tildeIndex >= 0 ? contentSegments[tildeIndex + 1] : undefined;

    if (kind !== 'revisions' && kind !== 'changes') {
        return isProxyRootRequest(url) ? null : { url: url.toString(), extraPath: '' };
    }

    const idIndex = tildeIndex + 2;
    const id = contentSegments[idIndex];
    const contentURL = new URL(url);
    contentURL.pathname = contentSegments.slice(0, tildeIndex).join('/');

    if (isProxyRootRequest(contentURL)) {
        return null;
    }

    return {
        url: contentURL.toString(),
        extraPath: pathSegments.slice(idIndex + 1).join('/'),
        basePath: contentSegments.slice(tildeIndex, idIndex + 1).join('/'),
        ...(kind === 'revisions' ? { revision: id } : { changeRequest: id }),
    };
}

/** Combine a resolved lookup with the remaining requested page path. */
export function getURLLookupPathname(
    alternative: { url: string; extraPath: string },
    resolved: { basePath: string; pathname: string }
) {
    if (
        alternative.extraPath &&
        removeTrailingSlash(new URL(alternative.url).pathname) ===
            removeTrailingSlash(resolved.basePath)
    ) {
        // A root lookup can resolve to a custom homepage, which is not a prefix for other pages.
        return joinPath('/', alternative.extraPath);
    }

    return joinPath(resolved.pathname, alternative.extraPath);
}

/**
 * Normalize the URL in a request and redirect if the normalized URL is different from the original one.
 */
export function normalizeRequestURL(url: URL): Response | null {
    try {
        const normalizedURL = normalizeURL(url);

        if (normalizedURL.toString() !== url.toString()) {
            return Response.redirect(normalizedURL.toString(), 302);
        }

        return null;
    } catch (error) {
        const sanitized = getExposableError(error);
        return new Response(sanitized.message, { status: sanitized.code });
    }
}

/**
 * Normalize a URL to remove duplicate slashes and trailing slashes
 * and decode the pathname to its canonical encoding.
 */
export function normalizeURL(url: URL) {
    const result = new URL(url);

    // Reject excessively long paths up-front to bound per-request work.
    if (url.pathname.length > 2048) {
        throw new DataFetcherError('URL path is too long.', 400);
    }

    result.pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '');
    return decodeURLPath(result);
}

/**
 * Decode the url path component, we redirect URLs with encoded path components
 * so that we don't end up with multiple URLs for the same content (especially important because of caching).
 * If after decoding the path contains invalid characters, we throw an error.
 * We limit the number of decoding passes to 2 to prevent DoS attacks via deeply-nested
 * percent-encoding. Legitimate URLs are at most singly encoded; double-encoding covers
 * any reasonable proxy behaviour.
 */
function decodeURLPath(url: URL): URL {
    let current = url;

    for (let i = 0; i < 2; i++) {
        const decoded = new URL(current);
        decoded.pathname = current.pathname
            .split('/')
            .map((segment) => {
                let result: string;
                try {
                    result = decodeURIComponent(segment);
                } catch {
                    throw new DataFetcherError(`URL path is malformed: ${url.pathname}`, 400);
                }
                // TODO: We should reenable this at one point, we just need to be more careful with what's allowed or not.
                // if (containsInvalidURLCharacters(result)) {
                //     throw new DataFetcherError(
                //         `URL path contains invalid characters: ${url.pathname}`,
                //         400
                //     );
                // }
                return result;
            })
            .join('/');

        if (decoded.pathname === current.pathname) {
            // Path is stable: the URL parser has re-encoded the decoded characters
            // back to their percent-encoded form (e.g. space → %20). This is the
            // canonical representation — decoding is complete.
            return decoded;
        }

        current = normalizeURL(decoded);

        if (!current.pathname.includes('%')) {
            // No remaining encoded characters – decoding is complete.
            return current;
        }
    }

    // Still has encoded characters after the maximum number of decoding passes.
    throw new DataFetcherError(`URL path is malformed: ${url.pathname}`, 400);
}

/**
 * Strip the search params from a URL
 */
export function stripURLSearch(url: URL): URL {
    const stripped = new URL(url.toString());
    stripped.search = '';
    return stripped;
}
