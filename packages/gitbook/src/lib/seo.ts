import { type RevisionPageDocument, type RevisionPageGroup, SiteVisibility } from '@gitbook/api';

import type { GitBookSiteContext, GitBookSiteScopeContext } from '@/lib/context';

/**
 * Return true if a page is indexable in search.
 */
export function isPageIndexable(
    ancestors: (RevisionPageDocument | RevisionPageGroup)[],
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
export function isSiteIndexable(context: GitBookSiteContext | GitBookSiteScopeContext) {
    if (context.noIndexSearch) {
        return false;
    }

    // Prevent indexation of preview of revisions / change-requests
    // It cannot happen for Scoped kind of route
    if (
        ('changeRequest' in context && context.changeRequest) ||
        ('space' in context && context.revisionId !== context.space.revision)
    ) {
        return false;
    }

    return shouldIndexVisibility(context.site.visibility);
}

function shouldIndexVisibility(visibility: SiteVisibility) {
    return visibility === SiteVisibility.Public;
}
