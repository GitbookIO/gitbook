import type {
    ContentRef,
    DocumentTableDefinition,
    DocumentTableRecord,
    DocumentTableViewCards,
} from '@gitbook/api';
import assertNever from 'assert-never';

/**
 * Get the value for a column in a record.
 */
export function getRecordValue<T extends number | string | boolean | string[] | ContentRef>(
    record: DocumentTableRecord,
    definitionId: string
): T {
    // @ts-ignore
    return record.values[definitionId];
}

/**
 * Get the covers for a record card.
 * Returns both the light and dark covers.
 * The light cover is a string or a content ref (image or files column type).
 * The dark cover is a content ref (image column type).
 */
export function getRecordCardCovers(record: DocumentTableRecord, view: DocumentTableViewCards) {
    return {
        light: view.coverDefinition
            ? (getRecordValue(record, view.coverDefinition) as ContentRef | string[])
            : null,
        dark: view.coverDefinitionDark
            ? (getRecordValue(record, view.coverDefinitionDark) as ContentRef)
            : null,
    };
}

/**
 * Get the text alignment for a column.
 */
export function getColumnAlignment(column: DocumentTableDefinition) {
    const defaultAlignment = 'text-left';

    if (column.type === 'text') {
        switch (column.textAlignment) {
            case undefined:
            case 'left':
                return defaultAlignment;
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            default:
                assertNever(column.textAlignment);
        }
    }

    return defaultAlignment;
}

/**
 * Get the vertical alignment for a column.
 */
export type VerticalAlignment = 'self-center' | 'self-end' | 'self-start';
export function getColumnVerticalAlignment(column: DocumentTableDefinition): VerticalAlignment {
    const verticalAlignment = 'verticalAlignment' in column ? column.verticalAlignment : 'center';

    if (verticalAlignment === 'top') {
        return 'self-start';
    }

    if (verticalAlignment === 'bottom') {
        return 'self-end';
    }

    return 'self-center';
}
