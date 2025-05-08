export enum SizableImageAction {
    Resize = 'resize',
    Skip = 'skip',
    Passthrough = 'passthrough',
}

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
    if (parsed.pathname.endsWith('.svg') || parsed.pathname.endsWith('.avif')) {
        return SizableImageAction.Passthrough;
    }

    return SizableImageAction.Resize;
}
