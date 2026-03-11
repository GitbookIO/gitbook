import { assert } from 'ts-essentials';
import { GITBOOK_PREVIEW_BASE_URL } from './env';

/**
 * Check if the request to the site is a preview request.
 */
export function isPreviewRequest(requestURL: URL): boolean {
    // TODO: Remove the `requestURL.host === 'preview'` condition once we have fully migrated to the new preview URL structure.
    return (
        requestURL.host === 'preview' || requestURL.toString().startsWith(GITBOOK_PREVIEW_BASE_URL)
    );
}

export function getPreviewRequestIdentifier(requestURL: URL): string {
    if (requestURL.toString().startsWith(GITBOOK_PREVIEW_BASE_URL)) {
        const siteIdentifier = requestURL.pathname.split('/').filter(Boolean)[1];
        assert(siteIdentifier, 'Expected site identifier in preview URL');
        return siteIdentifier;
    }

    // TODO: Remove the `requestURL.host === 'preview'` condition once we have fully migrated to the new preview URL structure.
    // For preview requests, we extract the site ID from the pathname
    // e.g. https://preview/site_id/...
    const pathname = requestURL.pathname.slice(1).split('/');
    return pathname[0]!;
}
