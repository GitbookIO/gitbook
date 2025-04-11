import { checkIsHttpURL } from '@/lib/urls';

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
