import {
    ContentRef,
    DocumentTableRecord,
    DocumentTableDefinition,
    DocumentTableViewGrid,
} from '@gitbook/api';

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

/**
 * Get the vertical alignment for a column.
 *
 * Vertical alignment is configurable on the column-level.
 */

export type VerticalAlignment = 'self-center' | 'self-end' | 'self-start';
export function getColumnVerticalAlignment(column: DocumentTableDefinition): VerticalAlignment {
    const verticalAlignment = column.verticalAlignment || 'center';

    if (verticalAlignment === 'top') {
        return 'self-start';
    }

    if (verticalAlignment === 'bottom') {
        return 'self-end';
    }

    return 'self-center';
}
