import { headers } from 'next/headers';

/**
 * Return true if events should be tracked on the site.
 */
export async function shouldTrackEvents(): Promise<boolean> {
    const headersList = await headers();

    if (
        process.env.NODE_ENV === 'development' ||
        (process.env.GITBOOK_BLOCK_PAGE_VIEWS_TRACKING &&
            !headersList.has('x-gitbook-track-page-views'))
    ) {
        return false;
    }

    return true;
}
