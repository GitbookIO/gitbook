/**
 * Check if a host is one of the GitBook proxy domains.
 */
export function isProxyHost(host: string): boolean {
    return host === 'proxy.gitbook.site' || host === 'proxy.gitbook-staging.site';
}

/**
 * Check if the request to the site was through a proxy.
 */
export function isProxyRequest(requestURL: URL): boolean {
    return isProxyHost(requestURL.host);
}

/**
 * Resolve the host to build the site URL from when a request carries an `x-forwarded-host`.
 *
 * A request that physically reaches GitBook on the proxy domain identifies its site by the
 * `/sites/<id>` path, not by its host. Some upstream proxies (e.g. a customer's Vercel rewrite
 * to the proxy domain) forward their own `x-forwarded-host`; trusting it would glue the customer
 * host onto the internal `/sites/<id>` path and resolve to a "Domain not found". When the request
 * actually arrived on the proxy domain, keep that host so the site resolves by its path instead.
 */
export function resolveForwardedHost(args: { host: string | null; forwardedHost: string }): string {
    const { host, forwardedHost } = args;
    if (host && isProxyHost(host)) {
        return host;
    }
    return forwardedHost;
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
