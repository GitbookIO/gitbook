import type { TableSelectColumn } from './search';

/** The option value each select column is pointed at by the reader's selection, keyed by column id. */
export type SlugFilter = Record<string, string>;

/**
 * Work out which option of each select column the reader's current selection points at.
 *
 * A table's select column declares its own option set, so a slug only filters a column that
 * actually offers it: a reader who picked `macos` narrows a Platform column to macOS and leaves a
 * Status column alone. Where several of a column's options are active at once, the most recently
 * activated wins — the same rule tabs resolve with, so a table and the tabs beside it agree.
 */
export function resolveSlugFilter(columns: TableSelectColumn[], slugs: string[]): SlugFilter {
    const filter: SlugFilter = {};

    for (const column of columns) {
        let best: string | undefined;
        let bestRank = Number.POSITIVE_INFINITY;

        for (const option of column.options) {
            const rank = slugs.indexOf(option.value);
            if (rank >= 0 && rank < bestRank) {
                bestRank = rank;
                best = option.value;
            }
        }

        if (best) {
            filter[column.id] = best;
        }
    }

    return filter;
}

/** Stable identity for a filter, so an effect only re-runs when the selection actually moves. */
export function slugFilterKey(filter: SlugFilter): string {
    return Object.entries(filter)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([column, value]) => `${column}=${value}`)
        .join(',');
}
