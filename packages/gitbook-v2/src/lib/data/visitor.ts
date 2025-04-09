import { withLeadingSlash, withTrailingSlash } from '@/lib/paths';
import type { PublishedSiteContent } from '@gitbook/api';
import { getProxyRequestIdentifier, isProxyRequest } from './proxy';

/**
 * Get the appropriate base path for the visitor authentication cookie.
 */
export function getVisitorAuthBasePath(
    siteRequestURL: URL,
    siteURLData: PublishedSiteContent
): string {
    // The siteRequestURL for proxy requests is of the form `https://proxy.gitbook.com/site/siteId/...`
    // In such cases, we should not use the resolved siteBasePath for the cookie because for subsequent requests
    // we will not have the siteBasePath in the request URL in order to retrieve the cookie. So we use the
    // proxy identifier instead.
    return isProxyRequest(siteRequestURL)
        ? withLeadingSlash(withTrailingSlash(getProxyRequestIdentifier(siteRequestURL)))
        : siteURLData.siteBasePath;
}
