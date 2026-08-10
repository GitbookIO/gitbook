'use client';

import { Button, Checkbox, DropdownMenu, DropdownMenuItem, Input } from '@/components/primitives';
import { tString, useLanguage } from '@/intl/client';
import { type ClassValue, tcls } from '@/lib/tailwind';
import { Icon } from '@gitbook/icons';
import React from 'react';
import type { TableCheckboxColumn, TableSelectColumn } from './search';
import { type SelectedOptions, recordMatches } from './searchMatch';

/**
 * Client-side table search.
 *
 * Site pages are statically rendered and can't read `searchParams`, so filtering happens entirely
 * on the client rather than round-tripping through the server. The provider matches every record
 * once and exposes the set of visible ids; each row/card just looks itself up by id.
 */

/** Per-record matching data, computed on the server. */
export interface TableSearchRecordData {
    /** Record key, matching the `key` passed to `<TableSearchRecord>`. */
    id: string;
    searchText: string;
    selectValues?: Record<string, string[]>;
    checkboxValues?: Record<string, boolean>;
}

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
};

const TableSearchContext = React.createContext<TableSearchContextValue | null>(null);

/**
 * Holds the search query and active filters for a single table.
 */
export function TableSearchProvider(props: {
    records?: TableSearchRecordData[];
    children: React.ReactNode;
}) {
    const { records = [] } = props;
    const [query, setQuery] = React.useState('');
    const [selectedOptions, setSelectedOptions] = React.useState<SelectedOptions>(() => ({}));
    const [checkedColumns, setCheckedColumns] = React.useState<ReadonlySet<string>>(
        () => new Set()
    );

    const toggleOption = React.useCallback((column: string, value: string) => {
        setSelectedOptions((previous) => {
            const values = new Set(previous[column]);
            if (values.has(value)) {
                values.delete(value);
            } else {
                values.add(value);
            }

            const next = { ...previous };
            if (values.size === 0) {
                delete next[column];
            } else {
                next[column] = values;
            }
            return next;
        });
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

    const hasActiveFilters =
        query.trim() !== '' || Object.keys(selectedOptions).length > 0 || checkedColumns.size > 0;

    // Match every record once, here, rather than in each row — rows just look themselves up by id.
    const visibleIds = React.useMemo(() => {
        if (!hasActiveFilters) {
            return null;
        }

        const ids = new Set<string>();
        for (const record of records) {
            if (
                recordMatches(
                    record.searchText,
                    record.selectValues,
                    record.checkboxValues,
                    query,
                    selectedOptions,
                    checkedColumns
                )
            ) {
                ids.add(record.id);
            }
        }
        return ids;
    }, [records, query, selectedOptions, checkedColumns, hasActiveFilters]);

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
        }),
        [query, selectedOptions, toggleOption, checkedColumns, toggleCheckbox, visibleIds, isEmpty]
    );

    return (
        <TableSearchContext.Provider value={value}>{props.children}</TableSearchContext.Provider>
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
                        onSelect={(event) => {
                            // Keep the menu open so several options can be toggled at once.
                            event.preventDefault();
                            toggleOption(column.id, option.value);
                        }}
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
