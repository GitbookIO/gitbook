import { GITBOOK_IMAGE_RESIZE_URL } from '@/lib/env';
import { getLogger } from '@/lib/logger';
import type { CloudflareImageOptions } from './types';
import { copyImageResponse } from './utils';

/**
 * Resize an image by doing a request to a /cdn/cgi/ endpoint.
 * https://developers.cloudflare.com/images/transform-images/transform-via-url/
 */
export async function resizeImageWithCDNCgi(
    input: string,
    options: CloudflareImageOptions & {
        signal?: AbortSignal;
    }
): Promise<Response> {
    const { signal, ...resizeOptions } = options;

    // Since Cloudflare Images options on fetch are not supported on Cloudflare Pages,
    // we need to use the Cloudflare Image Resize API directly.
    if (!GITBOOK_IMAGE_RESIZE_URL) {
        throw new Error('GITBOOK_IMAGE_RESIZE_URL is not set for cdn-cgi image resize mode');
    }

    const resizeURL = `${GITBOOK_IMAGE_RESIZE_URL}${stringifyOptions(
        resizeOptions
    )}/${encodeURIComponent(input)}`;

    const logger = getLogger().subLogger('imageResizing');
    logger.log(`resize image using cdn-cgi: ${resizeURL}`);

    return copyImageResponse(
        await fetch(resizeURL, {
            headers: {
                // Pass the `Accept` header, as Cloudflare uses this to validate the format.
                Accept:
                    resizeOptions.format === 'json'
                        ? 'application/json'
                        : `image/${resizeOptions.format || 'jpeg'}`,
            },
            signal,
        })
    );
}

function stringifyOptions(options: CloudflareImageOptions): string {
    return Object.entries({ ...options }).reduce((rest, [key, value]) => {
        return `${rest}${rest ? ',' : ''}${key}=${value}`;
    }, '');
}
