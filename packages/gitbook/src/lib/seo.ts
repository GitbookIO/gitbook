import type { GitBookSiteContext } from '@/lib/context';
import { type RevisionPageDocument, type RevisionPageGroup, SiteVisibility } from '@gitbook/api';

/**
 * Return true if a page is indexable in search.
 */
export function isPageIndexable(
    ancestors: Array<RevisionPageDocument | RevisionPageGroup>,
    page: RevisionPageDocument | RevisionPageGroup
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
export function isSiteIndexable(context: GitBookSiteContext) {
    if (context.noIndexSearch) {
        return false;
    }

    // Prevent indexation of preview of revisions / change-requests
    if (context.changeRequest || context.revisionId !== context.space.revision) {
        return false;
    }

    return shouldIndexVisibility(context.site.visibility);
}

function shouldIndexVisibility(visibility: SiteVisibility) {
    return visibility === SiteVisibility.Public;
}
