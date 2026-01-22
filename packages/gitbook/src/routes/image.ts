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
import { NextResponse } from 'next/server';

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

    // Cloudflare-specific options are in the cf object.
    const options: CloudflareImageOptions = {
        fit: 'scale-down',
        format: 'jpeg',
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
    if (accept && /image\/avif/.test(accept) && longestEdgeValue <= 1600) {
        const dpr = chooseDPR(longestEdgeValue, 1600, options.dpr);
        if (options.dpr === dpr) {
            options.format = 'avif';
        }
    } else if (accept && /image\/webp/.test(accept) && longestEdgeValue <= 1920) {
        const dpr = chooseDPR(longestEdgeValue, 1920, options.dpr);
        if (options.dpr === dpr) {
            options.format = 'avif';
        }
    }

    try {
        const response = await resizeImage(url, options);
        if (!response.ok) {
            throw new Error(`Failed to resize image, received status code ${response.status}`);
        }

        return response;
    } catch (error) {
        // Redirect to the original image if resizing fails
        console.warn('Error while resizing image, redirecting to original', error);
        return NextResponse.redirect(url, 302);
    }
}

/**
 * Choose the DPR allowed to resize an image on Cloudflare.
 * @see https://developers.cloudflare.com/images/transform-images/#limits-per-format
 */
function chooseDPR(longestEdgeValue: number, maxAllowedSize: number, wantedDpr?: number): number {
    const maxDprBySize = Math.floor(maxAllowedSize / longestEdgeValue);
    // Ensure that the DPR is within the allowed range
    return Math.max(1, Math.min(maxDprBySize, wantedDpr ?? 1));
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
