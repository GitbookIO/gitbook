import { headers } from 'next/headers';

/**
 * Return true if events should be tracked on the site.
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
