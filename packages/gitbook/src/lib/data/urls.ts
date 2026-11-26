import { isProxyRequest, isProxyRootRequest } from '../proxy';
import { DataFetcherError, getExposableError } from './errors';

/**
 * For a given GitBook URL, return the URL to resolve with the API.
 * Returns `null` for the root proxy URLs, which can never resolve to a site.
 */
export function getURLLookup(input: URL): string | null {
    const url = normalizeURL(input);
    return isProxyRootRequest(url) ? null : url.toString();
}

/**
 * Normalize the URL in a request before the lookup. Returns an error response if it is invalid,
 * or a redirect to the normalized URL if it can be built from the request URL.
 */
export function normalizeRequestURL(
    url: URL,
    mode: 'url' | 'url-host'
): Response | { isNormalized: boolean } {
    let normalizedURL: URL;
    try {
        normalizedURL = normalizeURL(url);
    } catch (error) {
        const sanitized = getExposableError(error);
        return new Response(sanitized.message, { status: sanitized.code });
    }

    const isNormalized = normalizedURL.toString() === url.toString();
    // A proxied site's public URL is only known after the lookup, which redirects to the canonical URL.
    if (!isNormalized && !(mode !== 'url' && isProxyRequest(url))) {
        return Response.redirect(normalizedURL.toString(), 302);
    }

    return { isNormalized };
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
