import { RevisionPageDocument, RevisionPageGroup, Site, SiteVisibility } from '@gitbook/api';
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
export async function isSiteIndexable(site: Site) {
    const headersList = await headers();

    if (
        process.env.GITBOOK_BLOCK_SEARCH_INDEXATION &&
        !headersList.has('x-gitbook-search-indexation')
    ) {
        return false;
    }

    // Prevent indexation of preview of revisions / change-requests
    if (
        headersList.get('x-gitbook-content-revision') ||
        headersList.get('x-gitbook-content-changerequest')
    ) {
        return false;
    }

    if (site) {
        return shouldIndexVisibility(site.visibility);
    }

    // space with no site should not be indexed
    return false;
}

function shouldIndexVisibility(visibility: SiteVisibility) {
    return visibility === SiteVisibility.Public;
}
