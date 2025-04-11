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
