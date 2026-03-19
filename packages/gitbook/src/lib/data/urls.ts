import { isProxyRootRequest } from '../proxy';
import { DataFetcherError, getExposableError } from './errors';

/**
 * For a given GitBook URL, return a list of alternative URLs that could be matched against to lookup the content.
 * The approach is optimized to aim at reusing cached lookup results as much as possible.
 *
 * The cases can be:
 *
 * Custom hostname
 *   - Public content has a custom hostname: docs.company.com/<path>
 *   - Public content has a custom hostname with a share-link: docs.company.com/<link>/<path>
 *   - Public content has a custom hostname with a variant: docs.company.com/v/<variant>/<path>
 *   - Public content has a custom hostname with a variant and a share-link: docs.company.com/<link>/v/<variant>/<path>
 *   - Revisions in a custom hostname: docs.company.com/~/revisions/<id>/<path>
 *   - Changes in a custom hostname: docs.company.com/~/changes/<id>/<path>
 *
 * Custom hostname in the organization or GitBook domain (company.gitbook.io)
 *   - Public content has a custom hostname in the organization: docs.company.com/<space>/<path>
 *   - Public content has a custom hostname in the organization with a share-link: docs.company.com/<space>/<link>/<path>
 *   - Public content has a custom hostname in the organization with a variant: docs.company.com/<space>/v/<variant>/<path>
 *   - Public content has a custom hostname in the organization with a variant and a share-link: docs.company.com/<space>/<link>/v/<variant>/<path>
 */
export function getURLLookupAlternatives(input: URL) {
    const url = normalizeURL(input);

    let basePath: string | undefined = undefined;
    let changeRequest: string | undefined = undefined;
    let revision: string | undefined = undefined;
    const alternatives: Array<{ url: string; extraPath: string; primary: boolean }> = [];

    const pushAlternative = (adding: URL, extraPath: string) => {
        const existing = alternatives.find((alt) => alt.url === adding.toString());
        if (existing) {
            if (existing.extraPath !== extraPath) {
                throw new Error(
                    `Invalid extraPath ${extraPath} for url ${adding.toString()}, already set to ${
                        existing.extraPath
                    }`
                );
            }
            return;
        }

        // We don't want to push the url if it is the root proxy URL (either https://proxy.gitbook.site or https://proxy.gitbook.site/sites)
        if (isProxyRootRequest(adding)) {
            return;
        }

        alternatives.push({
            url: adding.toString(),
            extraPath,
            primary: adding.toString() === url.toString(),
        });
    };

    const pathSegments = url.pathname.slice(1).split('/');
    const tildeIndex = pathSegments.indexOf('~');

    // URL looks like a specific content url (with ~/revisions/ or ~/changes/ in the path)
    // We only start matching after the ~/revisions/ or ~/changes/ segment and we ignore everything before it
    if (
        tildeIndex >= 0 &&
        (pathSegments[tildeIndex + 1] === 'revisions' || pathSegments[tildeIndex + 1] === 'changes')
    ) {
        const tildeIndex = pathSegments.indexOf('~');
        const revisionOrChangeIdIndex = tildeIndex + 2;

        basePath = pathSegments.slice(tildeIndex, revisionOrChangeIdIndex + 1).join('/');
        if (pathSegments[tildeIndex + 1] === 'revisions') {
            revision = pathSegments[revisionOrChangeIdIndex];
        } else {
            changeRequest = pathSegments[revisionOrChangeIdIndex];
        }

        // Match up to the tilde
        const contentURL = new URL(url);
        contentURL.pathname = pathSegments.slice(0, tildeIndex).join('/');
        pushAlternative(contentURL, pathSegments.slice(revisionOrChangeIdIndex + 1).join('/'));
    }

    // URL looks like a collection url (with /v/ in the path)
    // We only start matching after the /v/ segment and we ignore everything before it
    // to avoid potentially matching as a page not found under the default space in the collection
    else if (pathSegments.includes('v')) {
        const collectionURL = new URL(url);
        const vIndex = pathSegments.indexOf('v');
        collectionURL.pathname = pathSegments.slice(0, vIndex + 2).join('/');

        pushAlternative(collectionURL, pathSegments.slice(vIndex + 2).join('/'));
    } else {
        // Match only with the host, if it can be a custom hostname
        // It should cover most cases of custom domains, and with caching, it should be fast.
        if (!url.hostname.includes('.gitbook.io') || pathSegments.length === 0) {
            const noPathURL = new URL(url);
            noPathURL.pathname = '/';

            pushAlternative(noPathURL, url.pathname.slice(1));
        }

        // Otherwise match with the first four segments of the path
        for (let i = 1; i <= 4; i++) {
            if (pathSegments.length >= i) {
                const shortURL = new URL(url);
                shortURL.pathname = pathSegments.slice(0, i).join('/');

                pushAlternative(shortURL, pathSegments.slice(i).join('/'));
            }
        }
    }

    // Mark the longuest entry to lookup as primary
    alternatives.sort((a, b) => b.extraPath.length - a.extraPath.length);
    if (alternatives.length > 0) {
        alternatives[alternatives.length - 1]!.primary = true;
    }

    return { urls: alternatives, basePath, changeRequest, revision };
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
 * and transform the pathname to lowercase.
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
