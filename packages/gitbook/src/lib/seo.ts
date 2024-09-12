import { Collection, ContentVisibility, Site, SiteVisibility, Space } from '@gitbook/api';
import { headers } from 'next/headers';

/**
 * Return true if a space should be indexed by search engines.
 */
export function shouldIndexSpace({ space, parent }: { space: Space; parent: Site }) {
    const headerSet = headers();

    if (
        process.env.GITBOOK_BLOCK_SEARCH_INDEXATION &&
        !headerSet.has('x-gitbook-search-indexation')
    ) {
        return false;
    }

    // Prevent indexation of preview of revisions / change-requests
    if (
        headerSet.get('x-gitbook-content-revision') ||
        headerSet.get('x-gitbook-content-changerequest')
    ) {
        return false;
    }

    return shouldIndexVisibility(parent.visibility);
}

function shouldIndexVisibility(visibility: SiteVisibility) {
    return visibility === SiteVisibility.Public;
}
