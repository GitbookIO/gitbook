import type { Revision, RevisionPageDocument, RevisionPageGroup } from '@gitbook/api';

import type { PDFSearchParams } from './urls';
import { resolvePageId } from '@/lib/pages';

export type FlatPageEntry = { page: RevisionPageDocument | RevisionPageGroup; depth: number };

export interface PDFPageSelection {
    /** Pages rendered in the current batch */
    pages: FlatPageEntry[];
    /** Every page targeted by the export, across all batches */
    allPages: FlatPageEntry[];
    /** Index in `allPages` of the first page of the batch */
    offset: number;
    /** Total number of pages targeted by the export */
    total: number;
}

/**
 * Compute the ordered flat set of pages targeted by the export, and the batch to render.
 * Returns `null` if the requested page doesn't exist.
 */
export function selectPages(
    rootPages: Revision['pages'],
    params: Pick<PDFSearchParams, 'page' | 'only' | 'limit' | 'offset'>
): PDFPageSelection | null {
    const allPages = selectAllPages(rootPages, params);
    if (!allPages) {
        return null;
    }

    const total = allPages.length;
    // Fall back to the last batch rather than rendering an empty one.
    const offset = params.offset < total ? params.offset : Math.max(0, total - params.limit);

    return {
        pages: allPages.slice(offset, offset + params.limit),
        allPages,
        offset,
        total,
    };
}

function selectAllPages(
    rootPages: Revision['pages'],
    params: Pick<PDFSearchParams, 'page' | 'only'>
): FlatPageEntry[] | null {
    if (params.page) {
        const found = resolvePageId(rootPages, params.page);
        if (!found) {
            return null;
        }

        if (!params.only) {
            return [{ page: found.page, depth: 0 }];
        }

        return flattenPage(found.page, 0);
    }

    return rootPages.flatMap((page) => {
        if (page.type !== 'document' && page.type !== 'group') {
            return [];
        }

        if (page.hidden) {
            return [];
        }

        return flattenPage(page, 0);
    });
}

function flattenPage(
    page: RevisionPageDocument | RevisionPageGroup,
    depth: number
): FlatPageEntry[] {
    return [
        { page, depth },
        ...page.pages.flatMap((child) => {
            if (child.type !== 'document') {
                return [];
            }

            if (child.hidden) {
                return [];
            }

            return flattenPage(child, depth + 1);
        }),
    ];
}
