import { getLogger } from '@/lib/logger';
import type { CloudflareImageOptions } from './types';
import { copyImageResponse } from './utils';

/**
 * Resize an image by doing a request to the image itself using the Cloudflare fetch.
 * https://developers.cloudflare.com/images/transform-images/transform-via-workers/
 */
export async function resizeImageWithCFFetch(
    input: string,
    options: CloudflareImageOptions & {
        signal?: AbortSignal;
    }
): Promise<Response> {
    const { signal, ...resizeOptions } = options;

    const logger = getLogger().subLogger('imageResizing');
    logger.log(`resize image using cf-fetch: ${input}`);

    return copyImageResponse(
        await fetch(input, {
            headers: {
                // Pass the `Accept` header, as Cloudflare uses this to validate the format.
                Accept:
                    resizeOptions.format === 'json'
                        ? 'application/json'
                        : `image/${resizeOptions.format || 'jpeg'}`,
            },
            signal,
            cf: { image: resizeOptions },
        })
    );
}
