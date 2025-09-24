import type {
    CardsImageObjectFit,
    ContentRef,
    ContentRefFile,
    ContentRefURL,
    DocumentTableDefinition,
    DocumentTableImageRecord,
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
 * Returns both the light and dark covers with their content refs and optional object fit.
 * The light cover is a string or a content ref (image or files column type).
 * The dark cover is a content ref (image column type).
 */
export function getRecordCardCovers(
    record: DocumentTableRecord,
    view: DocumentTableViewCards
): {
    [key in 'light' | 'dark']: {
        contentRef: ContentRefFile | ContentRefURL | null;
        objectFit?: CardsImageObjectFit;
    };
} {
    const lightValue = view.coverDefinition
        ? (getRecordValue(record, view.coverDefinition) as DocumentTableImageRecord | string[])
        : null;

    const darkValue = view.coverDefinitionDark
        ? (getRecordValue(record, view.coverDefinitionDark) as DocumentTableImageRecord)
        : null;

    return {
        light: processCoverValue(lightValue),
        dark: processCoverValue(darkValue),
    };
}

/**
 * Process a cover value and return the content ref and object fit.
 */
function processCoverValue(value: DocumentTableImageRecord | string[] | null | undefined): {
    contentRef: ContentRefFile | ContentRefURL | null;
    objectFit?: CardsImageObjectFit;
} {
    if (!value) {
        return { contentRef: null };
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            return { contentRef: null };
        }

        if (typeof value[0] === 'string') {
            return { contentRef: { kind: 'file', file: value[0] } };
        }
    }

    const imageValue = value as DocumentTableImageRecord | null | undefined;

    // Check if it's the new schema with objectFit
    if (imageValue && typeof imageValue === 'object' && 'ref' in imageValue) {
        return {
            contentRef: imageValue.ref,
            objectFit: imageValue.objectFit,
        };
    }

    // It's a direct ContentRef
    return { contentRef: imageValue || null };
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

/**
 * Check if a value is a ContentRef.
 * @param ref The value to check.
 * @returns True if the value is a ContentRef, false otherwise.
 */
export function isContentRef(ref?: DocumentTableRecord['values'][string]): ref is ContentRef {
    return Boolean(ref && typeof ref === 'object' && 'kind' in ref);
}

/**
 * Check if a value is an array of strings.
 * @param value The value to check.
 * @returns True if the value is an array of strings, false otherwise.
 */
export function isStringArray(value?: DocumentTableRecord['values'][string]): value is string[] {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/**
 * Check if a value is a DocumentTableImageRecord.
 * @param value The value to check.
 * @returns True if the value is a DocumentTableImageRecord, false otherwise.
 */
export function isDocumentTableImageRecord(
    value?: DocumentTableRecord['values'][string]
): value is DocumentTableImageRecord {
    if (isContentRef(value) && (value.kind === 'file' || value.kind === 'url')) {
        return true;
    }
    return Boolean(value && typeof value === 'object' && 'ref' in value && isContentRef(value.ref));
}
