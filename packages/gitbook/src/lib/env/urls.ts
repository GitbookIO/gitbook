import { GITBOOK_ASSETS_URL, GITBOOK_URL } from './globals';

/**
 * Check if the URL is a GitBook host URL.
 */
export function isGitBookHostURL(input: URL | string): boolean {
    const url = typeof input === 'string' ? new URL(input) : input;

    if (!GITBOOK_URL) {
        return false;
    }

    const gitbookHost = new URL(GITBOOK_URL).host;

    if (url.host === gitbookHost) {
        return true;
    }

    // Handle the Cloudflare preview URLs that are prefixed with a random hash
    // https://developers.cloudflare.com/workers/configuration/previews/
    if (url.host.endsWith(`-${gitbookHost}`)) {
        return true;
    }

    return false;
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
