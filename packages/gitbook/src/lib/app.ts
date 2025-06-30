import { GITBOOK_APP_URL } from '@/lib/env';

/**
 * Create an absolute href in the GitBook application.
 */
export function getGitBookAppHref(pathname: string): string {
    const appUrl = new URL(GITBOOK_APP_URL);
    appUrl.pathname = pathname;

    return appUrl.toString();
}

/**
 * Sanitize a URL to be a valid GitBook.com app URL.
 */
export function sanitizeGitBookAppURL(input: string): string | null {
    if (!URL.canParse(input)) {
        return null;
    }

    const url = new URL(input);
    if (url.origin !== GITBOOK_APP_URL) {
        return null;
    }

    return url.toString();
}
