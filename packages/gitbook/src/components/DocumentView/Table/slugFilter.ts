import type { TableSelectColumn } from './search';
import type { SelectedOptions } from './searchMatch';
import { slugifySelectValue } from '@/lib/select';

/** One select column narrowed by the reader's content selection. */
export interface SlugFilterEntry {
    /** Id of the select column being narrowed. */
    column: string;
    /** The option's opaque value, which the record matcher compares against. */
    value: string;
    /** The option's author-typed label, shown to the reader. */
    label: string;
    /** The active slug that narrowed the column, so the reader can clear it again. */
    slug: string;
}

/**
 * The `select` slug an option answers to.
 *
 * A table option's `value` is an opaque generated key, so it is the author-typed `label` that names
 * it — the same wording a tab title or select button would carry, put through the same slugifier so
 * a "macOS" column option and a "macOS" tab resolve to the one slug. Options with no label fall back
 * to the raw value, mirroring how a cell renders one.
 */
export function getOptionSlug(option: { value: string; label: string }): string {
    return slugifySelectValue(option.label || option.value);
}

/**
 * Work out which option of each select column the reader's current selection points at.
 *
 * A table's select column declares its own option set, so a slug only filters a column that
 * actually offers it: a reader who picked `macos` narrows a Platform column to macOS and leaves a
 * Status column alone. Where several of a column's options are active at once, the most recently
 * activated wins — the same rule tabs resolve with, so a table and the tabs beside it agree.
 */
export function resolveSlugFilter(
    columns: TableSelectColumn[],
    slugs: string[]
): SlugFilterEntry[] {
    const entries: SlugFilterEntry[] = [];

    for (const column of columns) {
        let best: SlugFilterEntry | undefined;
        let bestRank = Number.POSITIVE_INFINITY;

        for (const option of column.options) {
            const slug = getOptionSlug(option);
            if (!slug) {
                continue;
            }

            const rank = slugs.indexOf(slug);
            if (rank >= 0 && rank < bestRank) {
                bestRank = rank;
                best = {
                    column: column.id,
                    value: option.value,
                    label: option.label || option.value,
                    slug,
                };
            }
        }

        if (best) {
            entries.push(best);
        }
    }

    return entries;
}

/** Stable identity for a filter, so it is only rebuilt when the selection actually moves. */
export function slugFilterKey(entries: SlugFilterEntry[]): string {
    return entries
        .map((entry) => `${entry.column}=${entry.value}`)
        .sort()
        .join(',');
}

/**
 * Fold the columns the selection narrows into the reader's own filters.
 *
 * Kept pure, and given the previously narrowed columns rather than reading them from a ref, so it
 * can be applied more than once without changing the answer — React may invoke a state updater
 * twice, and an earlier version tracked those columns inside the updater itself, which silently
 * undid a clear on the second pass.
 *
 * Only columns the selection narrowed last time are dropped; anything the reader filtered by hand
 * is left exactly as it was.
 */
export function reconcileSelectedOptions(
    previous: SelectedOptions,
    previouslyNarrowed: readonly string[],
    slugFilter: readonly SlugFilterEntry[]
): SelectedOptions {
    if (previouslyNarrowed.length === 0 && slugFilter.length === 0) {
        return previous;
    }

    const next = { ...previous };
    for (const column of previouslyNarrowed) {
        delete next[column];
    }
    for (const entry of slugFilter) {
        next[entry.column] = new Set([entry.value]);
    }
    return next;
}
