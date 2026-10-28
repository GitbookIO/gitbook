/**
 * Check if the request to the site was through a proxy.
 */
export function isProxyRequest(requestURL: URL): boolean {
    return (
        requestURL.host === 'proxy.gitbook.site' || requestURL.host === 'proxy.gitbook-staging.site'
    );
}

export function getProxyRequestIdentifier(requestURL: URL): string {
    // For proxy requests, we extract the site ID from the pathname
    // e.g. https://proxy.gitbook.site/site/siteId/...
    const pathname = requestURL.pathname.slice(1).split('/');
    return pathname.slice(0, 2).join('/');
}

/**
 * Check if the request is for the root of the proxy site (i.e. https://proxy.gitbook.site/ or https://proxy.gitbook.site/sites).
 * @param requestURL The URL of the request to check if it is a proxy root request.
 */
export function isProxyRootRequest(requestURL: URL): boolean {
    // Check if the request is for the root of the proxy site
    return (
        isProxyRequest(requestURL) &&
        (requestURL.pathname === '/' ||
            requestURL.pathname === '/sites' ||
            requestURL.pathname === '/sites/')
    );
}
