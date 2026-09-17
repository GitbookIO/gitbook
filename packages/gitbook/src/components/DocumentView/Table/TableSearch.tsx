'use client';

import React from 'react';

import { Icon } from '@gitbook/icons';

import type { TableCheckboxColumn, TableSelectColumn } from './search';
import {
    type SelectedOptions,
    type TableSearchRecordData,
    getVisibleTableRecordIds,
} from './searchMatch';
import {
    type SlugFilterEntry,
    getOptionSlug,
    resolveSlugFilter,
    slugFilterKey,
} from './slugFilter';
import { Button, Checkbox, DropdownMenu, DropdownMenuItem, Input } from '@/components/primitives';
import { tString, useLanguage } from '@/intl/client';
import { selectStore } from '@/lib/select';
import { type ClassValue, tcls } from '@/lib/tailwind';

/**
 * Client-side table search.
 *
 * Site pages are statically rendered and can't read `searchParams`, so filtering happens entirely
 * on the client rather than round-tripping through the server. The provider matches every record
 * once and exposes the set of visible ids; each row/card just looks itself up by id.
 */

type TableSearchContextValue = {
    query: string;
    setQuery: (query: string) => void;
    selectedOptions: SelectedOptions;
    toggleOption: (column: string, value: string) => void;
    /** Checkbox columns whose filter is currently enabled. */
    checkedColumns: ReadonlySet<string>;
    toggleCheckbox: (column: string) => void;
    /**
     * Ids of the records matching the active filters, or `null` when no filter is active
     * (in which case every record is shown).
     */
    visibleIds: ReadonlySet<string> | null;
    /** True when there are records but the active filters match none of them. */
    isEmpty: boolean;
    /** Select columns currently narrowed by the reader's content selection. */
    slugFilter: SlugFilterEntry[];
    /** Drop the selection driving {@link slugFilter}, site-wide. */
    clearSlugFilter: () => void;
};

const TableSearchContext = React.createContext<TableSearchContextValue | null>(null);

/**
 * Holds the search query and active filters for a single table.
 */
export function TableSearchProvider(props: {
    records?: TableSearchRecordData[];
    recordGroups?: readonly (readonly string[])[];
    /** Select columns of this table, so the reader's content selection can narrow them. */
    selectColumns?: TableSelectColumn[];
    children: React.ReactNode;
}) {
    const { records = [], recordGroups = [], selectColumns = [] } = props;
    const [query, setQuery] = React.useState('');
    const [selectedOptions, setSelectedOptions] = React.useState<SelectedOptions>(() => ({}));
    const [checkedColumns, setCheckedColumns] = React.useState<ReadonlySet<string>>(
        () => new Set()
    );

    // The selection that drives this lives outside the table — a tab, a select button or a picker
    // elsewhere on the page — so this synchronises with it rather than deriving from it.
    const slugFilter = useSlugFilter(selectColumns);

    // Columns the selection narrowed last time round. Kept so a new selection — or clearing it —
    // undoes the previous one, rather than leaving a filter the reader can no longer account for.
    const narrowedColumns = React.useRef<string[]>([]);

    // This render's values, so the stable callbacks below can read them without taking them as
    // dependencies — `selectColumns` and `slugFilter` are fresh arrays every render.
    const latest = React.useRef({ selectedOptions, slugFilter, selectColumns });
    React.useEffect(() => {
        latest.current = { selectedOptions, slugFilter, selectColumns };
    });

    const toggleOption = React.useCallback((column: string, value: string) => {
        const { selectedOptions, slugFilter, selectColumns } = latest.current;

        const values = new Set(selectedOptions[column]);
        if (values.has(value)) {
            values.delete(value);
        } else {
            values.add(value);
        }

        setSelectedOptions((previous) => {
            const next = { ...previous };
            if (values.size === 0) {
                delete next[column];
            } else {
                next[column] = values;
            }
            return next;
        });

        // Changing a column the selection is driving changes the selection itself, rather than
        // leaving the two to disagree: otherwise the notice would go on claiming a match that has
        // stopped being true, and the next page load would quietly restore the filter the reader
        // just replaced. Narrowing to a single option moves the selection to it — so a tab
        // elsewhere follows — while clearing it, or picking several at once, releases it, since
        // the selection holds one choice and cannot express those.
        const governing = slugFilter.find((entry) => entry.column === column);
        if (!governing) {
            return;
        }

        const only = values.size === 1 ? [...values][0] : undefined;
        const option = only
            ? selectColumns
                  .find((candidate) => candidate.id === column)
                  ?.options.find((candidate) => candidate.value === only)
            : undefined;

        if (option) {
            selectStore.activate(getOptionSlug(option));
            return;
        }

        // Hand the column back before releasing, so the reconciling effect below treats it as the
        // reader's own and leaves their choice of options alone.
        narrowedColumns.current = narrowedColumns.current.filter((narrowed) => narrowed !== column);
        selectStore.deactivate(governing.slug);
    }, []);

    const toggleCheckbox = React.useCallback((column: string) => {
        setCheckedColumns((previous) => {
            const next = new Set(previous);
            if (next.has(column)) {
                next.delete(column);
            } else {
                next.add(column);
            }
            return next;
        });
    }, []);

    React.useEffect(() => {
        setSelectedOptions((previous) => {
            if (narrowedColumns.current.length === 0 && slugFilter.length === 0) {
                return previous;
            }

            const next = { ...previous };
            for (const column of narrowedColumns.current) {
                delete next[column];
            }
            for (const entry of slugFilter) {
                next[entry.column] = new Set([entry.value]);
            }

            narrowedColumns.current = slugFilter.map((entry) => entry.column);
            return next;
        });
    }, [slugFilter]);

    // Clearing goes through the store rather than local state: the selection is what persists, so
    // only dropping it there stops the filter coming back on the next load. It is site-wide, so a
    // tab elsewhere on the page reverts to its default too.
    const clearSlugFilter = React.useCallback(() => {
        for (const entry of slugFilter) {
            selectStore.deactivate(entry.slug);
        }
    }, [slugFilter]);

    // Match every record once, here, rather than in each row — rows just look themselves up by id.
    const visibleIds = React.useMemo(
        () =>
            getVisibleTableRecordIds({
                records,
                recordGroups,
                query,
                selectedOptions,
                checkedColumns,
            }),
        [records, recordGroups, query, selectedOptions, checkedColumns]
    );

    const isEmpty = visibleIds !== null && records.length > 0 && visibleIds.size === 0;

    const value = React.useMemo(
        () => ({
            query,
            setQuery,
            selectedOptions,
            toggleOption,
            checkedColumns,
            toggleCheckbox,
            visibleIds,
            isEmpty,
            slugFilter,
            clearSlugFilter,
        }),
        [
            query,
            selectedOptions,
            toggleOption,
            checkedColumns,
            toggleCheckbox,
            visibleIds,
            isEmpty,
            slugFilter,
            clearSlugFilter,
        ]
    );

    return (
        <TableSearchContext.Provider value={value}>{props.children}</TableSearchContext.Provider>
    );
}

/**
 * The reader's selection, reduced to the columns of *this* table.
 *
 * Subscribes once and returns a string rather than an object: `useSyncExternalStore` compares
 * snapshots by identity, so a fresh object each call would loop. It also means a selection that
 * changes nothing for this table re-renders nothing — the reason `useSelect` stopped exposing the
 * recency list in the first place.
 */
function useSlugFilter(selectColumns: TableSelectColumn[]): SlugFilterEntry[] {
    const columnsKey = selectColumns
        .map(
            (column) =>
                `${column.id}:${column.options.map((option) => `${option.value}=${option.label}`).join('|')}`
        )
        .join(';');

    const getKey = React.useCallback(
        () => slugFilterKey(resolveSlugFilter(selectColumns, selectStore.getState().slugs)),
        // `selectColumns` is a fresh array each render; its contents are what matter.
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        [columnsKey]
    );

    const filterKey = React.useSyncExternalStore(selectStore.subscribe, getKey, getKey);

    // The key is only an identity: rebuild the filter itself when it moves, rather than parsing the
    // key back apart, since an option value can be any string an import gave it.
    return React.useMemo(
        () => resolveSlugFilter(selectColumns, selectStore.getState().slugs),
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        [filterKey]
    );
}

function useTableSearch(): TableSearchContextValue {
    const context = React.useContext(TableSearchContext);
    if (!context) {
        throw new Error('useTableSearch must be used within a <TableSearchProvider>');
    }
    return context;
}

/**
 * The search form rendered above a table, with a multi-select filter dropdown per select column.
 */
export function TableSearchInput(props: {
    selectColumns?: TableSelectColumn[];
    checkboxColumns?: TableCheckboxColumn[];
    className?: ClassValue;
}) {
    const { selectColumns = [], checkboxColumns = [] } = props;
    const language = useLanguage();
    const { query, setQuery } = useTableSearch();
    const hasFilters = selectColumns.length > 0 || checkboxColumns.length > 0;

    return (
        <Input
            label={tString(language, 'search')}
            value={query}
            onValueChange={setQuery}
            leading="magnifying-glass"
            clearButton
            sizing="small"
            keyboardShortcut={false}
            className={tcls('w-full', props.className)}
            trailing={
                hasFilters ? (
                    // Stop clicks from bubbling to the input container, which would refocus the input.
                    <div
                        className="flex items-center gap-1"
                        onClick={(event) => event.stopPropagation()}
                    >
                        {selectColumns.map((column) => (
                            <SelectFilterDropdown key={column.id} column={column} />
                        ))}
                        {checkboxColumns.map((column) => (
                            <CheckboxFilter key={column.id} column={column} />
                        ))}
                    </div>
                ) : undefined
            }
        />
    );
}

/**
 * Shown below the table when the active filters match no records.
 */
export function TableSearchEmpty(props: { className?: ClassValue }) {
    const language = useLanguage();
    const { query, isEmpty } = useTableSearch();

    if (!isEmpty) {
        return null;
    }

    const trimmed = query.trim();
    return (
        <div className={tcls('mx-auto py-8 text-center text-sm text-tint', props.className)}>
            {trimmed
                ? tString(language, 'search_no_results_for', trimmed)
                : tString(language, 'search_no_results')}
        </div>
    );
}

/**
 * Names the selection narrowing this table, and lets the reader drop it.
 *
 * Deliberately worded around the *selection* rather than the filter: the column dropdown beside it
 * shows the same column as active, but clearing there only resets local state and the filter returns
 * on the next load. This is the control that actually undoes it.
 *
 * Rendered independently of the search bar. `shouldShowTableSearch` leaves the filter controls off
 * cards, off grids below the row threshold, and off any table whose author turned search off — and
 * in every one of those a narrowed table would otherwise just read as missing rows.
 */
export function TableSelectionFilter(props: { className?: ClassValue }) {
    const language = useLanguage();
    const { slugFilter, clearSlugFilter } = useTableSearch();

    if (slugFilter.length === 0) {
        return null;
    }

    return (
        <div
            className={tcls('flex flex-wrap items-center gap-2 text-sm text-tint', props.className)}
        >
            <Icon icon="filter" className="size-3 shrink-0" />
            <span>
                {tString(
                    language,
                    'table_filtered_by_selection',
                    slugFilter.map((entry) => entry.label).join(', ')
                )}
            </span>
            <Button
                variant="blank"
                size="xsmall"
                icon="xmark"
                iconOnly
                label={tString(language, 'table_clear_selection')}
                onClick={clearSlugFilter}
            />
        </div>
    );
}

/**
 * A blank multi-select dropdown button for a single select column. Becomes `active` while any
 * of its options are selected.
 */
function SelectFilterDropdown(props: { column: TableSelectColumn }) {
    const { column } = props;
    const language = useLanguage();
    const { selectedOptions, toggleOption } = useTableSearch();
    const selectedValues = selectedOptions[column.id];
    const activeCount = selectedValues?.size ?? 0;
    // Fall back to a generic "Filter" label when the column title is hidden/empty.
    const label = column.label.trim() || tString(language, 'search_scope_title');

    return (
        <DropdownMenu
            align="end"
            button={
                <Button
                    variant="blank"
                    size="xsmall"
                    active={activeCount > 0}
                    label={activeCount > 1 ? `${label} · ${activeCount}` : label}
                    trailing={<Icon icon="chevron-down" className="size-3" />}
                />
            }
        >
            {column.options.map((option) => {
                const selected = selectedValues?.has(option.value) ?? false;
                return (
                    <DropdownMenuItem
                        key={option.value}
                        active={selected}
                        leadingIcon={selected ? 'check' : undefined}
                        // `closeOnClick={false}` keeps the menu open so several options can be
                        // toggled at once.
                        closeOnClick={false}
                        onClick={() => toggleOption(column.id, option.value)}
                    >
                        {option.label || option.value}
                    </DropdownMenuItem>
                );
            })}
        </DropdownMenu>
    );
}

/**
 * A checkbox control filtering the table to records where the given checkbox column is checked.
 */
function CheckboxFilter(props: { column: TableCheckboxColumn }) {
    const { column } = props;
    const language = useLanguage();
    const { checkedColumns, toggleCheckbox } = useTableSearch();
    const checked = checkedColumns.has(column.id);
    const id = `table-search-checkbox-${column.id}`;
    // Fall back to a generic "Filter" label when the column title is hidden/empty.
    const label = column.label.trim() || tString(language, 'search_scope_title');

    return (
        <label
            htmlFor={id}
            className="flex cursor-pointer select-none items-center gap-1.5 px-2 text-sm text-tint"
        >
            <Checkbox
                id={id}
                size="small"
                checked={checked}
                onCheckedChange={() => toggleCheckbox(column.id)}
            />
            {label}
        </label>
    );
}

type TableSearchRecordProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & {
    /** Record id, matching the `id` of the data passed to `<TableSearchProvider>`. */
    recordId: string;
    /** Display utility applied when the record matches (e.g. `flex` for rows, `contents` for cards). */
    visibleClassName: string;
    className?: ClassValue;
    children: React.ReactNode;
};

/**
 * Wraps a single table record (a grid row or a card) and hides it when it doesn't match
 * the current filters. Matching happens once in the provider; here we just look up the id.
 */
export function TableSearchRecord(props: TableSearchRecordProps) {
    const { recordId, visibleClassName, className, children, ...rest } = props;
    const { visibleIds } = useTableSearch();
    const matches = visibleIds === null || visibleIds.has(recordId);

    return (
        <div className={tcls(matches ? visibleClassName : 'hidden', className)} {...rest}>
            {children}
        </div>
    );
}

/** Keeps a complete native table row group visible when any of its records matches. */
export function TableSearchTableBody(
    props: React.HTMLAttributes<HTMLTableSectionElement> & { recordIds: readonly string[] }
) {
    const { recordIds, children, ...rest } = props;
    const { visibleIds } = useTableSearch();
    const matches = visibleIds === null || recordIds.some((recordId) => visibleIds.has(recordId));
    return matches ? <tbody {...rest}>{children}</tbody> : null;
}
