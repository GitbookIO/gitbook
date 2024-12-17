export interface ProxyToGitBookOptions {
    /**
     * The URL of the published site.
     * @example "https://mycompany.gitbook.io/docs"
     */
    site: string;

    /**
     * Base path to serve the site on.
     * @example "/docs"
     */
    basePath: string;
}

export interface ProxySite {
    /**
     * Test if the request should be proxied to this site.
     */
    match(request: Request | string): boolean;

    /**
     * Get the proxied request for a given request.
     */
    request(request: Request): Request;

    /**
     * Fetch the request from the site.
     */
    fetch(request: Request): Promise<Response>;
}

/**
 * Proxies requests to a GitBook site.
 */
export function proxyToGitBook(options: ProxyToGitBookOptions): ProxySite {
    const siteUrl = new URL(options.site);
    const basePath = normalizeBasePath(options.basePath);

    const siteUrlPathname = withoutTrailingSlash(siteUrl.pathname);

    const site: ProxySite = {
        match: (request) => {
            const pathname = typeof request === 'string' ? request : new URL(request.url).pathname;
            return pathname === basePath || pathname.startsWith(basePath + '/');
        },

        request: (originRequest) => {
            const originUrl = new URL(originRequest.url);

            const pathname = withLeadingSlash(originUrl.pathname.slice(basePath.length));

            const url = new URL(originUrl);
            url.hostname = siteUrl.hostname;
            url.pathname = siteUrlPathname + pathname;

            const proxyRequest = new Request(url, originRequest);

            proxyRequest.headers.set('Host', siteUrl.hostname);
            proxyRequest.headers.set('X-Forwarded-Host', originUrl.hostname);
            proxyRequest.headers.set('X-Forwarded-Proto', 'https');

            proxyRequest.headers.set('X-GitBook-BasePath', basePath);

            return proxyRequest;
        },

        fetch: async (originRequest) => {
            return fetch(site.request(originRequest));
        },
    };

    return site;
}

function normalizeBasePath(basePath: string): string {
    let result = withLeadingSlash(basePath);
    result = withoutTrailingSlash(result);
    return result;
}

function withLeadingSlash(path: string): string {
    return path.startsWith('/') ? path : '/' + path;
}

function withoutTrailingSlash(path: string): string {
    return path.endsWith('/') ? path.slice(0, -1) : path;
}
