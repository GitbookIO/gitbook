import { getExtension } from '@/lib/paths';

export enum SizableImageAction {
    Resize = 'resize',
    Skip = 'skip',
    Passthrough = 'passthrough',
}

/**
 * https://developers.cloudflare.com/images/transform-images/#supported-input-formats
 */
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Check if an image URL is resizable.
 * Skip it for non-http(s) URLs (data, etc).
 * Skip it for SVGs.
 * Skip it for GitBook images (to avoid recursion).
 */
export function checkIsSizableImageURL(input: string): SizableImageAction {
    if (!URL.canParse(input)) {
        return SizableImageAction.Skip;
    }

    const parsed = new URL(input);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return SizableImageAction.Skip;
    }
    if (parsed.hostname === 'localhost') {
        return SizableImageAction.Skip;
    }
    if (parsed.pathname.includes('/~gitbook/image')) {
        return SizableImageAction.Skip;
    }

    const extension = getExtension(parsed.pathname).toLowerCase();
    if (!extension || SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) {
        // If no extension, we consider it resizable.
        return SizableImageAction.Resize;
    }

    return SizableImageAction.Passthrough;
}
