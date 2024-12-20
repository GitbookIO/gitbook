import { headers } from 'next/headers';

/**
 * Return true if events hsould be tracked on the site.
 */
export function shouldTrackEvents(): boolean {
    const headerSet = headers();

    if (
        process.env.GITBOOK_BLOCK_PAGE_VIEWS_TRACKING &&
        !headerSet.has('x-gitbook-track-page-views')
    ) {
        return false;
    }

    return true;
}

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
