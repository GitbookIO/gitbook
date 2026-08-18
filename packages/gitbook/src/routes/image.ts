import { NextResponse } from 'next/server';

import {
    CURRENT_SIGNATURE_VERSION,
    type CloudflareResizeImageOptions,
    type SignatureVersion,
    SizableImageAction,
    checkIsSizableImageURL,
    isSignatureVersion,
    parseImageAPIURL,
    resizeImage,
    verifyImageSignature,
    IMAGE_REJECT_REASON_HEADER,
    ImageRejectReason,
} from '@/lib/images';

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

    const options: CloudflareResizeImageOptions = {
        fit: 'scale-down',
        // Let the image service negotiate the output format from the accept header.
        format: 'auto',
        quality: 100,
        accept: request.headers.get('accept') ?? undefined,
    };

    const width = requestURL.searchParams.get('width');
    if (width) {
        options.width = Number(width);
    }

    const height = requestURL.searchParams.get('height');
    if (height) {
        options.height = Number(height);
    }

    const dpr = requestURL.searchParams.get('dpr');
    if (dpr) {
        options.dpr = Number(dpr);
    }

    const quality = requestURL.searchParams.get('quality');
    if (quality) {
        options.quality = Number(quality);
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
            const rejectReason = response.headers.get(IMAGE_REJECT_REASON_HEADER);
            if (rejectReason) {
                switch (rejectReason) {
                    case ImageRejectReason.InvalidRequest:
                        return new Response('Invalid request', { status: 400 });
                    case ImageRejectReason.InvalidSignature:
                        return new Response('Invalid signature', { status: 400 });
                    case ImageRejectReason.UnsafeSourceURL:
                        return new Response('Unsafe source URL', { status: 400 });
                    case ImageRejectReason.UpstreamError:
                        // this one can happen for a lot of reasons, so we fallback to a redirect to the original image
                        // It sometimes happen when upstream block fetch from  our server
                        throw new Error('Upstream error, falling back to a redirect');
                    case ImageRejectReason.UnsupportedContentType:
                        throw new Error('Unsupported content type, falling back to a redirect');
                    case ImageRejectReason.InternalError:
                        throw new Error('Internal error, falling back to a redirect');
                    default:
                        throw new Error(
                            `Unknown reject reason "${rejectReason}", falling back to a redirect`
                        );
                }
            }
            throw new Error(`Failed to resize image, received status code ${response.status}`);
        }

        // The output format is negotiated from the accept header we forwarded.
        if (!response.headers.get('vary')?.toLowerCase().includes('accept')) {
            response.headers.append('vary', 'Accept');
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
