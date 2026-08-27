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
    format?: 'webp' | 'avif' | 'json' | 'jpeg' | 'png' | 'auto';
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
    width?: number;
    height?: number;
    dpr?: number;
    anim?: boolean;
    quality?: number;
}

export type CloudflareResizeImageOptions = CloudflareImageOptions & {
    signal?: AbortSignal;
    /**
     * Bypass the check to see if the image can be resized.
     * This is useful for some format that are not supported by @next/og and need to be transformed
     */
    bypassSkipCheck?: boolean;
    /**
     * Accept header of the incoming request, forwarded to the image service for content negotiation.
     */
    accept?: string;
};
