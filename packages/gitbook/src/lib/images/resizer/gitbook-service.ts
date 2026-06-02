import { GITBOOK_IMAGE_RESIZE_SIGNING_KEY, GITBOOK_IMAGE_RESIZE_URL } from '@/lib/env';
import { getLogger } from '@/lib/logger';
import type { CloudflareImageOptions } from './types';
import { copyImageResponse } from './utils';

function sdbmHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
        hash |= 0; // ensure 32-bit int
    }
    return hash;
}

/**
 * Resize an image using the GitBook image service.
 * https://images.gitbook.com/__img/<options>/<encoded-url>?sig=<signature>
 */
export async function resizeImageWithGitbookServices(
    input: string,
    options: CloudflareImageOptions & {
        signal?: AbortSignal;
    }
): Promise<Response> {
    const { signal, ...resizeOptions } = options;

    if (!GITBOOK_IMAGE_RESIZE_SIGNING_KEY) {
        throw new Error(
            'GITBOOK_IMAGE_RESIZE_SIGNING_KEY is not set for gitbook-service image resize mode'
        );
    }

    const signature = sdbmHash(`${input}:${GITBOOK_IMAGE_RESIZE_SIGNING_KEY}`).toString(16);
    const resizeURL = `${GITBOOK_IMAGE_RESIZE_URL}${stringifyOptions({
        ...resizeOptions,
        signature,
    })}/${encodeURIComponent(input)}?sig=${signature}`;

    const logger = getLogger().subLogger('imageResizing');
    logger.log(`resize image using gitbook-service: ${resizeURL}`);

    return copyImageResponse(
        await fetch(resizeURL, {
            headers: {
                Accept:
                    resizeOptions.format === 'json'
                        ? 'application/json'
                        : `image/${resizeOptions.format || 'jpeg'}`,
            },
            signal,
        })
    );
}

function stringifyOptions(options: CloudflareImageOptions & {signature: string}): string {
    return Object.entries({ ...options }).reduce((rest, [key, value]) => {
        return `${rest}${rest ? ',' : ''}${key}=${value}`;
    }, '');
}
