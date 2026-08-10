import type {
    DocumentBlockTable,
    DocumentTableRecord,
    DocumentTableSelectOption,
} from '@gitbook/api';

import { getNodeFragmentByName, getNodeText } from '@/lib/document';

export type TableRecordKV = [string, DocumentTableRecord];

export interface TableSelectColumn {
    /** Column id (the column key in `block.data.definition`). */
    id: string;
    /** Column title, shown on the filter button. */
    label: string;
    /** Available options for the column. */
    options: DocumentTableSelectOption[];
}

/**
 * All column ids of a table: visible columns first (in view order), then any hidden ones (defined
 * but not shown). The filter input offers every column, so hidden select/checkbox fields are
 * filterable too even though they aren't displayed.
 */
function getTableColumnIds(block: DocumentBlockTable): string[] {
    const visible = block.data.view.columns;
    return [
        ...visible,
        ...Object.keys(block.data.definition).filter((id) => !visible.includes(id)),
    ];
}

/**
 * List the "select" columns of a table along with their options, including hidden fields.
 * Used to render the per-column filter dropdowns next to the search input.
 */
export function getTableSelectColumns(block: DocumentBlockTable): TableSelectColumn[] {
    return getTableColumnIds(block).flatMap((column) => {
        const definition = block.data.definition[column];
        if (definition?.type !== 'select') {
            return [];
        }

        return [{ id: column, label: definition.title, options: definition.options }];
    });
}

export interface TableCheckboxColumn {
    /** Column id. */
    id: string;
    /** Column title, shown next to the checkbox. */
    label: string;
}

/**
 * List the "checkbox" columns of a table, including hidden fields.
 * Used to render a filter checkbox per column next to the search input.
 */
export function getTableCheckboxColumns(block: DocumentBlockTable): TableCheckboxColumn[] {
    return getTableColumnIds(block).flatMap((column) => {
        const definition = block.data.definition[column];
        if (definition?.type !== 'checkbox') {
            return [];
        }

        return [{ id: column, label: definition.title }];
    });
}

/**
 * Build the search data for a record (searchable text + select/checkbox values) in a single
 * pass over its columns. Used to feed the client-side table search (see `TableSearch`).
 */
export function getTableRecordSearchData(block: DocumentBlockTable, record: DocumentTableRecord) {
    const searchText: string[] = [];
    const selectValues: Record<string, string[]> = {};
    const checkboxValues: Record<string, boolean> = {};

    // Free-text search only covers visible columns; select/checkbox filters also cover hidden
    // columns, since those are offered in the filter input.
    const visibleColumns = new Set(block.data.view.columns);
    for (const column of getTableColumnIds(block)) {
        if (visibleColumns.has(column)) {
            const text = getTableCellSearchText(block, record, column);
            if (text) {
                searchText.push(text);
            }
        }

        const value = record.values[column];
        switch (block.data.definition[column]?.type) {
            case 'select':
                if (Array.isArray(value)) {
                    selectValues[column] = value.filter(
                        (item): item is string => typeof item === 'string'
                    );
                }
                break;
            case 'checkbox':
                if (typeof value === 'boolean') {
                    checkboxValues[column] = value;
                }
                break;
        }
    }

    return { searchText: searchText.join(' '), selectValues, checkboxValues };
}

function getTableCellSearchText(
    block: DocumentBlockTable,
    record: DocumentTableRecord,
    column: string
): string {
    const definition = block.data.definition[column];
    const value = record.values[column];

    if (!definition || value === null || value === undefined) {
        return '';
    }

    switch (definition.type) {
        case 'text': {
            if (typeof value !== 'string') {
                return '';
            }

            const fragment = getNodeFragmentByName(block, value);
            return normalizeSearchText(fragment ? getNodeText(fragment) : '');
        }
        case 'select': {
            if (!Array.isArray(value)) {
                return '';
            }

            return normalizeSearchText(
                value
                    .map((selectId) => {
                        return (
                            definition.options.find((option) => option.value === selectId)?.label ??
                            selectId
                        );
                    })
                    .join(' ')
            );
        }
        case 'number':
        case 'rating': {
            return typeof value === 'number' ? `${value}` : '';
        }
        case 'checkbox': {
            return typeof value === 'boolean' ? `${value}` : '';
        }
        // Reference-like columns (files, users, content-ref, image) render resolved names/text
        // asynchronously in `RecordColumnValue`. We only have raw ids here, so indexing them would
        // never match the visible text — leave them out rather than search opaque ids.
        default:
            return '';
    }
}

function normalizeSearchText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}
