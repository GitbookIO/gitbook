import type { PublishedSiteContent } from '@gitbook/api';
import { joinPath, removeTrailingSlash, withLeadingSlash } from './paths';

/**
 * Compute the final base path for a site served in proxy mode.
 * For e.g. if the input URL is `https://example.com/docs/v2/foo/bar` on which
 * the site is served at `https://example.com/docs` and the resolved base path is `/v2`
 * then the proxy site path would be `/docs/v2/`.
 */
export function getProxyModeBasePath(
    input: URL,
    resolved: Pick<PublishedSiteContent, 'basePath' | 'pathname'>
): string {
    const inputPathname = new URL(input).pathname;
    const proxySitePath = inputPathname
        .replace(removeTrailingSlash(resolved.pathname), '')
        .replace(removeTrailingSlash(resolved.basePath), '');

    const result = joinPath(withLeadingSlash(proxySitePath), resolved.basePath);
    return result.endsWith('/') ? result : `${result}/`;
}
