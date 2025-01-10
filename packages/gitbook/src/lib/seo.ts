import {
    ContentVisibility,
    RevisionPageDocument,
    RevisionPageGroup,
    Site,
    SiteVisibility,
    Space,
} from '@gitbook/api';

import { GitBookContext } from './gitbook-context';

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
export function isSpaceIndexable(
    ctx: GitBookContext,
    { space, site }: { space: Space; site: Site | null },
) {
    if (process.env.GITBOOK_BLOCK_SEARCH_INDEXATION && !ctx.searchIndexation) {
        return false;
    }

    // Prevent indexation of preview of revisions / change-requests
    if (ctx.contentRevisionId || ctx.changeRequestId) {
        return false;
    }

    if (site) {
        return shouldIndexVisibility(site.visibility);
    }

    // space with no site should not be indexed
    return false;
}

function shouldIndexVisibility(visibility: ContentVisibility | SiteVisibility) {
    return visibility === ContentVisibility.Public;
}
