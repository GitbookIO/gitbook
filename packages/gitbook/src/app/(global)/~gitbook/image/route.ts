import { NextRequest } from 'next/server';

import { isSignatureVersion, SignatureVersion, verifyImageSignature } from '@/lib/image-signatures';
import { resizeImage, CloudflareImageOptions, checkIsSizableImageURL } from '@/lib/images';
import { parseImageAPIURL } from '@/lib/urls';

export const runtime = 'edge';

/**
 * Only on Cloudflare Workers:
 *
 * Fetch and resize an image.
 */
export async function GET(request: NextRequest) {
    let urlParam = request.nextUrl.searchParams.get('url');
    const signature = request.nextUrl.searchParams.get('sign');

    if (!urlParam || !signature) {
        return new Response('Missing url/sign parameters', { status: 400 });
    }

    const signatureVersion = parseSignatureVersion(request.nextUrl.searchParams.get('sv'));
    if (!signatureVersion) {
        return new Response(`Invalid sv parameter`, { status: 400 });
    }

    const url = parseImageAPIURL(urlParam);

    // Check again if the image can be sized, even though we checked when rendering the Image component
    // Otherwise, it's possible to pass just any link to this endpoint and trigger HTML injection on the domain
    // Also prevent infinite redirects.
    if (!checkIsSizableImageURL(url)) {
        return new Response('Invalid url parameter', { status: 400 });
    }

    // Verify the signature
    const verified = await verifyImageSignature(url, { signature, version: signatureVersion });
    if (!verified) {
        return new Response(`Invalid signature "${signature ?? ''}" for "${url}"`, { status: 400 });
    }

    // Cloudflare-specific options are in the cf object.
    const options: CloudflareImageOptions = {
        fit: 'scale-down',
        format: 'jpeg',
        quality: 100,
    };

    const width = request.nextUrl.searchParams.get('width');
    if (width) {
        options.width = Number(width);
    }

    const height = request.nextUrl.searchParams.get('height');
    if (height) {
        options.height = Number(height);
    }

    const dpr = request.nextUrl.searchParams.get('dpr');
    if (dpr) {
        options.dpr = Number(dpr);
    }

    const quality = request.nextUrl.searchParams.get('quality');
    if (quality) {
        options.quality = Number(quality);
    }

    // Check the Accept header to handle content negotiation
    const accept = request.headers.get('accept');
    if (accept && /image\/avif/.test(accept)) {
        options.format = 'avif';
    } else if (accept && /image\/webp/.test(accept)) {
        options.format = 'webp';
    }

    try {
        const response = await resizeImage(url, options);
        if (!response.ok) {
            throw new Error('Failed to resize image');
        }

        return response;
    } catch (error) {
        // Redirect to the original image if resizing fails
        return Response.redirect(url, 302);
    }
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
