/**
 * Get the site identifier to use for image resizing for an incoming request.
 * This identifier can be obtained before resolving the request URL.
 */
export function getImageResizingSiteId(url: URL): string {
    if (url.host === 'proxy.gitbook.com') {
        // For proxy requests, we extract the site ID from the pathname
        // e.g. https://proxy.gitbook.com/site/siteId/...
        const pathname = url.pathname.slice(1).split('/');
        return pathname.slice(0, 2).join('/');
    }

    return url.host;
}
