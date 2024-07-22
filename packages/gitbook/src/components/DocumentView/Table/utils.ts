import { ContentRef, DocumentTableRecord, DocumentTableDefinition } from '@gitbook/api';

/**
 * Get the value for a column in a record.
 */
export function getRecordValue<T extends number | string | boolean | string[] | ContentRef>(
    record: DocumentTableRecord,
    definitionId: string,
): T {
    // @ts-ignore
    return record.values[definitionId];
}

/**
 * Get the text alignment for a column.
 */
export function getColumnAlignment(column: DocumentTableDefinition): 'left' | 'right' | 'center' {
    if (column.type === 'text') {
        return column.textAlignment ?? 'left';
    }
    return 'left';
}
