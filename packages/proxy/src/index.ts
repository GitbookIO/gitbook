
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

/**
 * Proxies requests to a GitBook site.
 */
export function proxyToGitBook(originRequest: Request, options: ProxyToGitBookOptions): Promise<Response> {
    const originUrl = new URL(originRequest.url);

    const siteUrl = new URL(options.site);

    const url = new URL(originUrl);
    url.hostname = siteUrl.hostname;

    const proxyRequest = new Request(url, originRequest);

    proxyRequest.headers.set("Host", siteUrl.hostname);
    proxyRequest.headers.set("X-Forwarded-Host", originUrl.hostname);
    proxyRequest.headers.set("X-Forwarded-Proto", "https");

    proxyRequest.headers.set('X-GitBook-BasePath', options.basePath);

    return fetch(proxyRequest);
}
