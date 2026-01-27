import {
    CURRENT_SIGNATURE_VERSION,
    type CloudflareImageOptions,
    type SignatureVersion,
    SizableImageAction,
    checkIsSizableImageURL,
    isSignatureVersion,
    parseImageAPIURL,
    resizeImage,
    verifyImageSignature,
} from '@/lib/images';
import type { CloudflareResizeImageOptions } from '@/lib/images/resizer';
import { NextResponse } from 'next/server';

const FORMATS = [
    {
        format: 'avif' as const,
        regexp: /image\/avif/,
        maxAllowedEdge: 1600,
    },
    {
        format: 'webp' as const,
        regexp: /image\/webp/,
        maxAllowedEdge: 1920,
    },
];

/**
 * Resize an image using the Cloudflare Image API.
 */
export async function serveResizedImage(
    request: Request,
    requestOptions: {
        /**
         * The site identifier to use for verifying the image signature.
         */
        imagesContextId?: string;
    } = {}
) {
    const requestURL = new URL(request.url);
    const urlParam = requestURL.searchParams.get('url');
    const signature = requestURL.searchParams.get('sign');

    if (!urlParam || !signature) {
        return new Response('Missing url/sign parameters', { status: 400 });
    }

    const signatureVersion = parseSignatureVersion(requestURL.searchParams.get('sv'));
    if (!signatureVersion) {
        return new Response('Invalid sv parameter', { status: 400 });
    }

    const url = parseImageAPIURL(urlParam);

    // Check again if the image can be sized, even though we checked when rendering the Image component
    // Otherwise, it's possible to pass just any link to this endpoint and trigger HTML injection on the domain
    // Also prevent infinite redirects.
    if (checkIsSizableImageURL(url) === SizableImageAction.Skip) {
        return new Response('Invalid url parameter', { status: 400 });
    }

    // Verify the signature
    const imagesContextId =
        requestOptions.imagesContextId ??
        request.headers.get('x-gitbook-host') ?? // Only for v1, to be removed
        request.headers.get('x-forwarded-host') ??
        request.headers.get('host') ??
        requestURL.host;
    const verified = await verifyImageSignature(
        {
            url,
            imagesContextId,
        },
        { signature, version: signatureVersion }
    );
    if (!verified) {
        return new Response(
            `Invalid signature "${signature ?? ''}" (version ${signatureVersion}) for "${url}" on identifier "${imagesContextId}"`,
            { status: 400 }
        );
    }

    if (signatureVersion !== CURRENT_SIGNATURE_VERSION) {
        return NextResponse.redirect(url, 302);
    }

    const defaultFormat = getOriginalFormatFromURL(url);

    // Cloudflare-specific options are in the cf object.
    const options: CloudflareImageOptions = {
        fit: 'scale-down',
        // For GIF, we will use webp as default format for resizing.
        format: defaultFormat === 'gif' ? 'webp' : defaultFormat,
        quality: 100,
    };

    const width = requestURL.searchParams.get('width');
    if (width) {
        options.width = Number(width);
    }

    const height = requestURL.searchParams.get('height');
    if (height) {
        options.height = Number(height);
    }

    const longestEdgeValue = Math.max(options.width || 0, options.height || 0);

    const dpr = requestURL.searchParams.get('dpr');
    if (dpr) {
        options.dpr = Number(dpr);
    }

    const quality = requestURL.searchParams.get('quality');
    if (quality) {
        options.quality = Number(quality);
    }

    // Check the Accept header to handle content negotiation
    const accept = request.headers.get('accept');

    // We test if we can use AVIF based on the accept header and constraints from Cloudflare
    // @see https://developers.cloudflare.com/images/transform-images/#limits-per-format
    if (accept) {
        for (const entry of FORMATS) {
            if (entry.regexp.test(accept) && longestEdgeValue <= entry.maxAllowedEdge) {
                const wantedDpr = options.dpr ?? 1;
                const dpr = chooseDPR(longestEdgeValue, entry.maxAllowedEdge, wantedDpr);
                if (dpr === wantedDpr) {
                    options.format = entry.format;
                    break;
                }
            }
        }
    }

    return resizeImageWithFallback(
        url,
        options,
        // For GIF, we won't fallback to any format, we will just serve the original
        defaultFormat === 'gif' ? null : defaultFormat
    );
}

/**
 * Try to resize the image in an optimized format.
 * If not possible, fallback to a default format.
 */
async function resizeImageWithFallback(
    url: string,
    options: CloudflareResizeImageOptions,
    formatFallback: 'jpeg' | 'png' | null
) {
    try {
        const response = await resizeImage(url, options);
        if (!response.ok) {
            throw new Error(`Failed to resize image, received status code ${response.status}`);
        }
        return response;
    } catch (error) {
        if (formatFallback && options.format !== formatFallback) {
            return resizeImageWithFallback(
                url,
                { ...options, format: formatFallback },
                formatFallback
            );
        }

        // Redirect to the original image if resizing fails
        console.warn('Error while resizing image, redirecting to original', error);
        return NextResponse.redirect(url, 302);
    }
}

/**
 * Get the original format from URL.
 */
function getOriginalFormatFromURL(url: string) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    if (pathname.endsWith('.gif')) {
        return 'gif';
    }
    if (pathname.endsWith('.png')) {
        return 'png';
    }
    return 'jpeg';
}

/**
 * Choose the DPR allowed to resize an image on Cloudflare.
 * @see https://developers.cloudflare.com/images/transform-images/#limits-per-format
 */
function chooseDPR(longestEdgeValue: number, maxAllowedEdge: number, wantedDpr: number): number {
    const maxDprBySize = Math.floor(maxAllowedEdge / longestEdgeValue);
    // Ensure that the DPR is within the allowed range
    return Math.max(1, Math.min(maxDprBySize, wantedDpr));
}

/**
 * Parse the image signature version from a query param. Returns null if the version is invalid.
 */
function parseSignatureVersion(input: string | null): SignatureVersion | null {
    // Before introducing the sv parameter, all signatures were generated with version 0.
    if (!input) {
        return '0';
    }

    // If the query param explicitly asks for a signature version.
    if (isSignatureVersion(input)) {
        return input;
    }

    // Otherwise the version is invalid.
    return null;
}
