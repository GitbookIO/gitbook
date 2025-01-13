import 'server-only';

import { noCacheFetchOptions } from '@/lib/cache/http';

import { generateImageSignature } from './image-signatures';
import { getRootUrl } from './links';
import { getImageAPIUrl } from './urls';

export interface CloudflareImageJsonFormat {
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
 * Return true if images resizing is enabled.
 */
export function isImageResizingEnabled(): boolean {
    return !!process.env.GITBOOK_IMAGE_RESIZE_SIGNING_KEY;
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

interface ResizeImageOptions {
    width?: number;
    height?: number;
    dpr?: number;
    quality?: number;
}

/**
 * Create a function to get resized image URLs for a given image URL.
 */
export async function getResizedImageURLFactory(
    input: string,
): Promise<((options: ResizeImageOptions) => string) | null> {
    if (!checkIsSizableImageURL(input)) {
        return null;
    }

    const [{ signature, version }, rootUrl] = await Promise.all([
        generateImageSignature(input),
        getRootUrl(),
    ]);

    return (options) => {
        const url = new URL('/~gitbook/image', rootUrl);
        url.searchParams.set('url', getImageAPIUrl(input));

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

        url.searchParams.set('sign', signature);
        url.searchParams.set('sv', version);

        return url.toString();
    };
}

/**
 * Create a new URL for an image with resized parameters.
 * The URL is signed and verified by the server.
 */
export async function getResizedImageURL(
    input: string,
    options: ResizeImageOptions,
): Promise<string> {
    const factory = await getResizedImageURLFactory(input);
    return factory?.(options) ?? input;
}

/**
 * Get the size of an image.
 */
export async function getImageSize(
    input: string,
    defaultSize: Partial<CloudflareImageOptions> = {},
): Promise<{ width: number; height: number } | null> {
    if (!isImageResizingEnabled() || !checkIsSizableImageURL(input)) {
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
        console.error(
            `failed to fetch image size for ${input}: ${
                (error as Error).stack ?? (error as Error).message ?? error
            }`,
        );
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
    },
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
    if (process.env.GITBOOK_IMAGE_RESIZE_URL) {
        const response = await fetch(
            `${process.env.GITBOOK_IMAGE_RESIZE_URL}${stringifyOptions(
                resizeOptions,
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
                ...noCacheFetchOptions,
            },
        );

        return response;
    }

    return fetch(parsed, {
        // @ts-ignore
        cf: {
            image: resizeOptions,
        },
        signal,
    });
}

function stringifyOptions(options: CloudflareImageOptions): string {
    return Object.entries({ ...options }).reduce((rest, [key, value]) => {
        return `${rest}${rest ? ',' : ''}${key}=${value}`;
    }, '');
}
