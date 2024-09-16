import { headers } from 'next/headers';

/**
 * Return true if a space track page views.
 */
export function shouldTrackPageViews(): boolean {
    const headerSet = headers();

    if (
        process.env.GITBOOK_BLOCK_PAGE_VIEWS_TRACKING &&
        !headerSet.has('x-gitbook-track-page-views')
    ) {
        return false;
    }

    return true;
}
