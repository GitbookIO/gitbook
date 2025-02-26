import type { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { isPageIndexable } from './seo';

export type FlatPageEntry = { page: RevisionPageDocument; depth: number };

/**
 * Flatten all the pages in a revision.
 */
function flattenPages(
    rootPages: RevisionPage[],
    filter: (page: RevisionPageDocument | RevisionPageGroup) => boolean
): FlatPageEntry[] {
    const flattenPage = (
        page: RevisionPageDocument | RevisionPageGroup,
        depth: number
    ): FlatPageEntry[] => {
        const allowed = filter(page);
        if (!allowed) {
            return [];
        }

        return [
            ...(page.type === 'document' ? [{ page, depth }] : []),
            ...page.pages.flatMap((child) =>
                child.type === 'document' ? flattenPage(child, depth + 1) : []
            ),
        ];
    };

    return rootPages.flatMap((page) =>
        page.type === 'group' || page.type === 'document' ? flattenPage(page, 0) : []
    );
}

/**
 * Get all indexable pages from a revision in a flat list.
 */
export function getIndexablePages(rootPages: RevisionPage[]) {
    return flattenPages(rootPages, (page) => !page.hidden && isPageIndexable([], page));
}
