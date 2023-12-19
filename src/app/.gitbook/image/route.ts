import { NextRequest } from 'next/server';

import { verifyImageSignature, resizeImage, CloudflareImageOptions } from '@/lib/images';

export const runtime = 'edge';

/**
 * Only on Cloudflare Workers:
 *
 * Fetch and resize an image.
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    const signature = request.nextUrl.searchParams.get('sign');
    if (!url || !signature) {
        return new Response('Missing url/sign parameters', { status: 400 });
    }

    // Prevent infinite loops
    if (url.includes('/.gitbook/image')) {
        return new Response('Invalid url parameter', { status: 400 });
    }

    // Verify the signature
    const verified = await verifyImageSignature(url, signature);
    if (!verified) {
        return new Response('Invalid signature', { status: 400 });
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
        return response;
    } catch (error) {
        // Redirect to the original image if resizing fails
        return Response.redirect(url, 302);
    }
}
