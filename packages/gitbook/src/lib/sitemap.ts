import type { RevisionPage, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import { isPageIndexable } from './seo';

export type FlatPageEntry = { page: RevisionPageDocument; depth: number };

/**
 * Flatten all the pages in a revision.
 */
function flattenPages(
    rootPages: RevisionPage[],
    filter: (
        page: RevisionPageDocument | RevisionPageGroup,
        ancestors: Array<RevisionPageDocument | RevisionPageGroup>
    ) => boolean
): FlatPageEntry[] {
    const flattenPage = (
        page: RevisionPageDocument | RevisionPageGroup,
        depth: number,
        ancestors: Array<RevisionPageDocument | RevisionPageGroup>
    ): FlatPageEntry[] => {
        const allowed = filter(page, ancestors);
        if (!allowed) {
            return [];
        }

        const children: FlatPageEntry[] = [];
        for (const child of page.pages) {
            if (child.type === 'link' || child.type === 'computed') {
                continue;
            }

            children.push(...flattenPage(child, depth + 1, [...ancestors, page]));
        }

        return [...(page.type === 'document' ? [{ page, depth }] : []), ...children];
    };

    return rootPages.flatMap((page) =>
        page.type === 'group' || page.type === 'document' ? flattenPage(page, 0, []) : []
    );
}

/**
 * Get all indexable pages from a revision in a flat list.
 */
export function getIndexablePages(rootPages: RevisionPage[]) {
    return flattenPages(rootPages, (page, ancestors) => isPageIndexable(ancestors, page));
}
