import { headers } from 'next/headers';

/**
 * Return true if events should be tracked on the site.
 */
export async function shouldTrackEvents(): Promise<boolean> {
    const headersList = await headers();

    // No tracking in development mode
    if (process.env.NODE_ENV === 'development') {
        return false;
    }

    const headerValue = headersList.get('x-gitbook-track-page-views');

    // No tracking if environment variable is set and header does not override it.
    if (process.env.GITBOOK_BLOCK_PAGE_VIEWS_TRACKING && headerValue !== null) {
        return false;
    }

    // Passing a 0 will disable tracking
    return headerValue !== '0';
}
