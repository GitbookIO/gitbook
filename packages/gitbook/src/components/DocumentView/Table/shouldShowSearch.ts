import type { DocumentBlockTable } from '@gitbook/api';

/**
 * Number of records a grid table needs before the search bar is shown by default.
 *
 * Duplicated in `@gitbook/doc-core` (`table/search.ts`) so the editor preview matches this default.
 * There's no shared module for it — GBO consumes the published `@gitbook/api`, not `doc-core` — so
 * the two copies must be kept in sync by hand when changing the default behaviour.
 */
export const MIN_RECORDS_FOR_SEARCH = 7;

/**
 * Decide whether to render the search bar for a table block.
 *
 * Authors can force search on or off per block via `block.data.search`. When that override is left
 * unset, we fall back to a smart default: search appears on grid tables once they have enough rows,
 * and stays off on cards. Search is never shown when printing, regardless of the override.
 */
export function shouldShowTableSearch(args: {
    /** Number of records in the table. */
    recordCount: number;
    /** The table view type (`grid` or `cards`). */
    viewType: DocumentBlockTable['data']['view']['type'];
    /** Explicit per-block override, from `block.data.search`; `undefined` defers to the default. */
    searchOverride: boolean | undefined;
    /** Whether the document is being rendered for print/PDF, where search is never shown. */
    isPrint: boolean;
}): boolean {
    if (args.isPrint) {
        return false;
    }

    const showByDefault = args.recordCount >= MIN_RECORDS_FOR_SEARCH && args.viewType === 'grid';

    return args.searchOverride ?? showByDefault;
}
