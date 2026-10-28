import assertNever from 'assert-never';

import type { DocumentBlockTable, DocumentTableRecord } from '@gitbook/api';

import { isContentRef, isDocumentTableImageRecord, isStringArray } from './utils';
import { getNodeFragmentByName, isNodeEmpty } from '@/lib/document';

/**
 * Check if a column of a record renders nothing at all, mirroring `RecordColumnValue`.
 * Used by cards to drop a field (and its title) instead of leaving a hole in the layout.
 *
 * Reference-like columns (files, users, content-ref, image) are only checked against their raw
 * value: whether a ref actually resolves is only known asynchronously, at render time.
 */
export function isRecordColumnEmpty(
    block: DocumentBlockTable,
    record: DocumentTableRecord,
    column: string
): boolean {
    const definition = block.data.definition[column];
    const value = record.values[column];

    if (!definition) {
        return true;
    }

    switch (definition.type) {
        case 'checkbox':
            // An unchecked box is still rendered.
            return typeof value !== 'boolean';
        case 'rating':
            // Mirror the renderer, which paints the stars on a truthy rating only.
            return typeof value !== 'number' || !value;
        case 'number':
            return typeof value !== 'number';
        case 'text': {
            if (typeof value !== 'string') {
                return true;
            }
            const fragment = getNodeFragmentByName(block, value);
            return !fragment || isNodeEmpty(fragment);
        }
        case 'files':
        case 'users':
            return !isStringArray(value) || value.length === 0;
        case 'select':
            return (
                !isStringArray(value) ||
                !value.some((selectId) =>
                    definition.options.some((option) => option.value === selectId)
                )
            );
        case 'content-ref':
            return !isContentRef(value);
        case 'image':
            return !isDocumentTableImageRecord(value);
        default:
            assertNever(definition);
    }
}
