import type { DocumentBlockTable, DocumentTableRecord } from '@gitbook/api';

import { getNodeFragmentByName, getNodeText } from '@/lib/document';

export type TableRecordKV = [string, DocumentTableRecord];

export function filterTableRecordsBySearchTerm(
    block: DocumentBlockTable,
    records: TableRecordKV[],
    searchTerm: string | undefined
): TableRecordKV[] {
    const trimmedSearchTerm = searchTerm?.trim();
    if (!trimmedSearchTerm) {
        return records;
    }

    return records.filter(([, record]) =>
        block.data.view.columns.some((column) => {
            const text = getTableCellSearchText(block, record, column);
            return new RegExp(trimmedSearchTerm, 'iu').test(text);
        })
    );
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
