import type { ImageResizer, ResizeImageOptions } from './types';

/**
 * Quick utility to get a resized image URL.
 */
export async function getResizedImageURL(
    resizer: ImageResizer | undefined,
    url: string,
    options: ResizeImageOptions
) {
    const getURL = resizer?.getResizedImageURL(url);
    if (!getURL) {
        return url;
    }

    return await getURL(options);
}

/**
 * Header stamped on every image request the service refuses to serve, so a rejection can be
 * told apart from a source error without parsing the body.
 */
export const IMAGE_REJECT_REASON_HEADER = 'x-gitbook-reject-reason';

/**
 * Reason an image request was rejected, reported in {@link IMAGE_REJECT_REASON_HEADER}.
 */
export enum ImageRejectReason {
    /** The request path is missing the resizing options or the source URL. */
    InvalidRequest = 'invalid-request',
    /** The signature is missing or does not match the source URL. */
    InvalidSignature = 'invalid-signature',
    /** The source URL is not a public http(s) host. */
    UnsafeSourceURL = 'unsafe-source-url',
    /** The source responded with an error status. */
    UpstreamError = 'upstream-error',
    /** The response is not something we are willing to serve as an image. */
    UnsupportedContentType = 'unsupported-content-type',
    /** The request failed while being processed. */
    InternalError = 'internal-error',
}
