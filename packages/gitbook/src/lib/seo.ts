import { Collection, ContentVisibility, Site, SiteVisibility, Space } from '@gitbook/api';
import { headers } from 'next/headers';

/**
 * Return true if a space should be indexed by search engines.
 */
export function shouldIndexSpace({
    space,
    parent,
}: {
    space: Space;
    parent: Site | Collection | null;
}) {
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

    if (parent && parent.object === 'site') {
        return shouldIndexVisibility(parent.visibility);
    }

    if (space.visibility === ContentVisibility.InCollection) {
        return parent && parent.object === 'collection'
            ? shouldIndexVisibility(parent.visibility)
            : false;
    }
    return shouldIndexVisibility(space.visibility);
}

function shouldIndexVisibility(visibility: ContentVisibility | SiteVisibility) {
    return visibility === ContentVisibility.Public;
}
