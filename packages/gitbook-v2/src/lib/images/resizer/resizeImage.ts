import 'server-only';
import { getLogger } from '@v2/lib/logger';
import assertNever from 'assert-never';
import { GITBOOK_IMAGE_RESIZE_MODE } from '../../env';
import { SizableImageAction, checkIsSizableImageURL } from '../checkIsSizableImageURL';
import { resizeImageWithCDNCgi } from './cdn-cgi';
import { resizeImageWithCFFetch } from './cf-fetch';
import type { CloudflareImageJsonFormat, CloudflareImageOptions } from './types';

/**
 * Get the size of an image.
 */
export async function getImageSize(
    input: string,
    defaultSize: Partial<CloudflareImageOptions> = {}
): Promise<{ width: number; height: number } | null> {
    if (checkIsSizableImageURL(input) !== SizableImageAction.Resize) {
        return null;
    }

    try {
        const response = await resizeImage(input, {
            // Abort the request after 2 seconds to avoid blocking rendering for too long
            signal: AbortSignal.timeout(2000),
            // Measure size and resize it to the most common size
            // to optimize caching
            ...defaultSize,
            format: 'json',
            anim: false,
        });

        const json = (await response.json()) as CloudflareImageJsonFormat;
        return {
            width: json.original.width,
            height: json.original.height,
        };
    } catch (error) {
        const logger = getLogger().subLogger('get-image-size');
        logger.warn(`Error getting image size for ${input}:`, error);
        return null;
    }
}

/**
 * Execute a Cloudflare Image Resize operation on an image.
 */
export async function resizeImage(
    input: string,
    options: CloudflareImageOptions & {
        signal?: AbortSignal;
    }
): Promise<Response> {
    const action = checkIsSizableImageURL(input);
    if (action === SizableImageAction.Skip) {
        throw new Error(
            'Cannot resize this image, this function should have never been called on this url'
        );
    }

    if (action === SizableImageAction.Passthrough) {
        return fetch(input, {
            signal: options.signal,
        });
    }

    switch (GITBOOK_IMAGE_RESIZE_MODE) {
        case 'cdn-cgi':
            return resizeImageWithCDNCgi(input, options);
        case 'cf-fetch':
            return resizeImageWithCFFetch(input, options);
        default:
            assertNever(GITBOOK_IMAGE_RESIZE_MODE);
    }
}
