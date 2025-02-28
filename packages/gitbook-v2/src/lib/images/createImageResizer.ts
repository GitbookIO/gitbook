import 'server-only';

import { GITBOOK_IMAGE_RESIZE_SIGNING_KEY, GITBOOK_IMAGE_RESIZE_URL } from '../env';
import type { GitBookSpaceLinker } from '../links';
import { type SignatureVersion, generateImageSignature } from './signatures';
import type { ImageResizer } from './types';

interface CloudflareImageJsonFormat {
    width: number;
    height: number;
    original: {
        file_size: number;
        width: number;
        height: number;
        format: string;
    };
}

/**
 * https://developers.cloudflare.com/images/image-resizing/resize-with-workers/
 */
export interface CloudflareImageOptions {
    format?: 'webp' | 'avif' | 'json' | 'jpeg';
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
    width?: number;
    height?: number;
    dpr?: number;
    anim?: boolean;
    quality?: number;
}

/**
 * Create an image resizer for a rendering context.
 */
export function createImageResizer({
    host,
    linker,
}: {
    /** The linker to use to create URLs. */
    linker: GitBookSpaceLinker;
    /** The host name of the current site. */
    host: string;
}): ImageResizer {
    if (!GITBOOK_IMAGE_RESIZE_URL || !GITBOOK_IMAGE_RESIZE_SIGNING_KEY) {
        return createNoopImageResizer();
    }

    return {
        getResizedImageURL: (urlInput) => {
            if (!checkIsSizableImageURL(urlInput)) {
                return null;
            }

            let cachedSignature: {
                signature: string;
                version: SignatureVersion;
            } | null = null;

            return async (options) => {
                cachedSignature ??= await generateImageSignature({
                    host,
                    url: urlInput,
                });

                const url = new URL(
                    linker.toAbsoluteURL(linker.toPathInContent('/~gitbook/image'))
                );
                url.searchParams.set('url', getImageAPIUrl(urlInput));

                if (options.width) {
                    url.searchParams.set('width', options.width.toString());
                }
                if (options.height) {
                    url.searchParams.set('height', options.height.toString());
                }
                if (options.dpr) {
                    url.searchParams.set('dpr', options.dpr.toString());
                }
                if (options.quality) {
                    url.searchParams.set('quality', options.quality.toString());
                }

                url.searchParams.set('sign', cachedSignature.signature);
                url.searchParams.set('sv', cachedSignature.version);

                return url.toString();
            };
        },

        getImageSize: async (input, options) => {
            if (!checkIsSizableImageURL(input)) {
                return null;
            }

            return getImageSize(input, options);
        },
    };
}

/**
 * Create an image resizer that doesn't do any resizing.
 */
export function createNoopImageResizer(): ImageResizer {
    return {
        getResizedImageURL: () => null,
        getImageSize: async (_input) => null,
    };
}

/**
 * Check if a URL is an HTTP URL.
 */
export function checkIsHttpURL(input: string | URL): boolean {
    if (!URL.canParse(input)) {
        return false;
    }
    const parsed = new URL(input);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

/**
 * Check if an image URL is resizable.
 * Skip it for non-http(s) URLs (data, etc).
 * Skip it for SVGs.
 * Skip it for GitBook images (to avoid recursion).
 */
export function checkIsSizableImageURL(input: string): boolean {
    if (!URL.canParse(input)) {
        return false;
    }

    if (input.includes('/~gitbook/image')) {
        return false;
    }

    const parsed = new URL(input);
    if (parsed.pathname.endsWith('.svg') || parsed.pathname.endsWith('.avif')) {
        return false;
    }
    if (!checkIsHttpURL(parsed)) {
        return false;
    }

    return true;
}

/**
 * Get the size of an image.
 */
export async function getImageSize(
    input: string,
    defaultSize: Partial<CloudflareImageOptions> = {}
): Promise<{ width: number; height: number } | null> {
    if (!checkIsSizableImageURL(input)) {
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
    } catch (_error) {
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
    const { signal, ...resizeOptions } = options;

    const parsed = new URL(input);
    if (parsed.protocol === 'data:') {
        throw new Error('Cannot resize data: URLs');
    }

    if (parsed.hostname === 'localhost') {
        throw new Error('Cannot resize localhost URLs');
    }

    // Since Cloudflare Images options on fetch are not supported on Cloudflare Pages,
    // we need to use the Cloudflare Image Resize API directly.
    if (!GITBOOK_IMAGE_RESIZE_URL) {
        throw new Error('GITBOOK_IMAGE_RESIZE_URL is not set');
    }

    return await fetch(
        `${GITBOOK_IMAGE_RESIZE_URL}${stringifyOptions(
            resizeOptions
        )}/${encodeURIComponent(input)}`,
        {
            headers: {
                // Pass the `Accept` header, as Cloudflare uses this to validate the format.
                Accept:
                    resizeOptions.format === 'json'
                        ? 'application/json'
                        : `image/${resizeOptions.format || 'jpeg'}`,
            },
            signal,
        }
    );
}

function stringifyOptions(options: CloudflareImageOptions): string {
    return Object.entries({ ...options }).reduce((rest, [key, value]) => {
        return `${rest}${rest ? ',' : ''}${key}=${value}`;
    }, '');
}

/**
 * Because of a bug in Cloudflare, 127.0.0.1 is replaced by localhost.
 * We protect against it by converting to a special token, and then parsing
 * the token in the image API.
 */
const GITBOOK_LOCALHOST_TOKEN = '$GITBOOK_LOCALHOST$';

/**
 * Prepare a URL for the GitBook Open Image API.
 */
export function getImageAPIUrl(url: string): string {
    return url.replaceAll('127.0.0.1', GITBOOK_LOCALHOST_TOKEN);
}

export function parseImageAPIURL(url: string): string {
    return url.replaceAll(GITBOOK_LOCALHOST_TOKEN, '127.0.0.1');
}
