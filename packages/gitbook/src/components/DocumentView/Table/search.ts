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
 * List the visible "select" columns of a table along with their options.
 * Used to render the per-column filter dropdowns next to the search input.
 */
export function getTableSelectColumns(block: DocumentBlockTable): TableSelectColumn[] {
    return block.data.view.columns.flatMap((column) => {
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
 * List the visible "checkbox" columns of a table.
 * Used to render a filter checkbox per column next to the search input.
 */
export function getTableCheckboxColumns(block: DocumentBlockTable): TableCheckboxColumn[] {
    return block.data.view.columns.flatMap((column) => {
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

    for (const column of block.data.view.columns) {
        const text = getTableCellSearchText(block, record, column);
        if (text) {
            searchText.push(text);
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
        case 'files':
        case 'users': {
            return Array.isArray(value) ? normalizeSearchText(value.join(' ')) : '';
        }
        default:
            return '';
    }
}

function normalizeSearchText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}
