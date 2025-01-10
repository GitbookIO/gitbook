import { GitBookContext } from './gitbook-context';

/**
 * Return true if events should be tracked on the site.
 */
export function shouldTrackEvents(ctx: GitBookContext): boolean {
    if (
        process.env.NODE_ENV === 'development' ||
        (process.env.GITBOOK_BLOCK_PAGE_VIEWS_TRACKING && !ctx.trackPageViews)
    ) {
        return false;
    }

    return true;
}
