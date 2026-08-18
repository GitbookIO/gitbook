import { GITBOOK_ASSETS_URL, GITBOOK_URL } from './globals';

/**
 * Check if the URL is a GitBook host URL.
 */
export function isGitBookHostURL(input: URL | string): boolean {
    const url = typeof input === 'string' ? new URL(input) : input;
    return matchesGitBookHost(url.host);
}

// Check a bare host (`hostname[:port]`), incl. Cloudflare preview URLs prefixed with a hash.
export function matchesGitBookHost(host: string): boolean {
    if (!GITBOOK_URL) {
        return false;
    }
    const gitbookHost = new URL(GITBOOK_URL).host;
    return host === gitbookHost || host.endsWith(`-${gitbookHost}`);
}

/**
 * Check if the URL is a GitBook assets host URL.
 */
export function isGitBookAssetsHostURL(input: URL | string): boolean {
    const url = typeof input === 'string' ? new URL(input) : input;

    if (!GITBOOK_ASSETS_URL) {
        return false;
    }

    const gitbookAssetsHost = new URL(GITBOOK_ASSETS_URL).host;

    if (url.host === gitbookAssetsHost) {
        return true;
    }

    return false;
}
