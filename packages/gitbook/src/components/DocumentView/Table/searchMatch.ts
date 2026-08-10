/**
 * Pure matching logic for the client-side table search.
 *
 * Kept free of React/client dependencies so it can be unit-tested in isolation and shared
 * between the search UI and (potentially) other callers.
 */

/** Selected option values per select column, keyed by column id. */
export type SelectedOptions = Readonly<Record<string, ReadonlySet<string>>>;

/**
 * Whether a record passes the current filters.
 *
 * The text query, each select column and each enabled checkbox column are combined with AND:
 * a record must match the text (when present), satisfy every column that has a selection, and
 * be checked for every enabled checkbox column. Within a single select column the selected
 * values are combined with OR — the record matches the column if it has any of them.
 */
export function recordMatches(
    searchText: string,
    selectValues: Record<string, string[]> | undefined,
    checkboxValues: Record<string, boolean> | undefined,
    query: string,
    selectedOptions: SelectedOptions,
    checkedColumns: ReadonlySet<string>
): boolean {
    if (query.trim() !== '' && !matchesText(searchText, query)) {
        return false;
    }

    for (const [column, values] of Object.entries(selectedOptions)) {
        if (values.size === 0) {
            continue;
        }

        const recordValues = selectValues?.[column];
        const matchesColumn = !!recordValues && recordValues.some((value) => values.has(value));
        if (!matchesColumn) {
            return false;
        }
    }

    for (const column of checkedColumns) {
        if (checkboxValues?.[column] !== true) {
            return false;
        }
    }

    return true;
}

/**
 * Whether a record's searchable text contains the query.
 *
 * Plain case-insensitive substring match: the field is a free-text search, so regex
 * metacharacters (`.`, `+`, `(`, …) are matched literally rather than treated as patterns.
 */
export function matchesText(searchText: string, query: string): boolean {
    const trimmed = query.trim();
    if (!trimmed) {
        return true;
    }

    return searchText.toLowerCase().includes(trimmed.toLowerCase());
}
