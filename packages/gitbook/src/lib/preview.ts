/**
 * Check if the request to the site is a preview request.
 */
export function isPreviewRequest(requestURL: URL): boolean {
    return requestURL.host === 'preview';
}

export function getPreviewRequestIdentifier(requestURL: URL): string {
    // For preview requests, we extract the site ID from the pathname
    // e.g. https://preview/site_id/...
    const pathname = requestURL.pathname.slice(1).split('/');
    return pathname[0]!;
}
