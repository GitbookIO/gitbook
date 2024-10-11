import {
    Collection,
    ContentVisibility,
    RevisionPageDocument,
    RevisionPageGroup,
    Site,
    SiteVisibility,
    Space,
} from '@gitbook/api';
import { headers } from 'next/headers';

/**
 * Return true if a page is indexable in search.
 */
export function isPageIndexable(
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>,
    page: RevisionPageDocument | RevisionPageGroup,
): boolean {
    // @ts-ignore - noIndex and noRobotsIndex are not in the type
    // until we fix the deprecated APIs
    return (
        // @ts-ignore
        !page.noIndex &&
        // @ts-ignore
        !page.noRobotsIndex &&
        // @ts-ignore
        ancestors.every((ancestor) => !ancestor.noIndex && !ancestor.noRobotsIndex)
    );
}

/**
 * Return true if a space should be indexed by search engines.
 */
export function isSpaceIndexable({
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

    return shouldIndexVisibility(parent.visibility);
}

function shouldIndexVisibility(visibility: SiteVisibility) {
    return visibility === SiteVisibility.Public;
}
