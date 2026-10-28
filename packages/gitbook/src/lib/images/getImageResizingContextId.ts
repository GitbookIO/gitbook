import { getPreviewRequestIdentifier, isPreviewRequest } from '@/lib/preview';
import { getProxyRequestIdentifier, isProxyRequest } from '@/lib/proxy';

/**
 * Get the site identifier to use for image resizing for an incoming request.
 * This identifier can be obtained before resolving the request URL.
 */
export function getImageResizingContextId(url: URL): string {
    if (isProxyRequest(url)) {
        return getProxyRequestIdentifier(url);
    }
    if (isPreviewRequest(url)) {
        return getPreviewRequestIdentifier(url);
    }

    return url.host;
}
