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
