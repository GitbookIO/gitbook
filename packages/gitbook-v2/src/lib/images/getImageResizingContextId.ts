import { getProxyRequestIdentifier, isProxyRequest } from '../data';

/**
 * Get the site identifier to use for image resizing for an incoming request.
 * This identifier can be obtained before resolving the request URL.
 */
export function getImageResizingContextId(url: URL): string {
    if (isProxyRequest(url)) {
        return getProxyRequestIdentifier(url);
    }

    return url.host;
}
