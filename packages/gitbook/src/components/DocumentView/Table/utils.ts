import type {
    ContentRef,
    ContentRefFile,
    ContentRefURL,
    DocumentTableDefinition,
    DocumentTableRecord,
    DocumentTableViewCards,
} from '@gitbook/api';

/**
 * Cover value can be either a direct ContentRef or an object with objectFit and ref
 */
export type CoverValue =
    | ContentRefFile
    | ContentRefURL
    | {
          objectFit: string;
          ref: ContentRefFile | ContentRefURL;
      };
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
        objectFit?: string;
    };
} {
    return {
        light: (() => {
            if (!view.coverDefinition) {
                return { contentRef: null };
            }

            const value = getRecordValue(record, view.coverDefinition) as CoverValue | string[];

            if (Array.isArray(value)) {
                if (value.length === 0) {
                    return { contentRef: null };
                }

                if (typeof value[0] === 'string') {
                    return { contentRef: { kind: 'file', file: value[0] } };
                }
            }

            // Check if it's the new schema with objectFit
            if (value && typeof value === 'object' && 'ref' in value && 'objectFit' in value) {
                return {
                    contentRef: value.ref,
                    objectFit: value.objectFit,
                };
            }

            // It's a direct ContentRef
            return { contentRef: value as ContentRefFile | ContentRefURL };
        })(),
        dark: (() => {
            if (!view.coverDefinitionDark) {
                return { contentRef: null };
            }

            const value = getRecordValue(record, view.coverDefinitionDark) as CoverValue;

            if (!value) {
                return { contentRef: null };
            }

            // Check if it's the new schema with objectFit
            if (typeof value === 'object' && 'ref' in value && 'objectFit' in value) {
                return {
                    contentRef: value.ref,
                    objectFit: value.objectFit,
                };
            }

            // It's a direct ContentRef
            return { contentRef: value as ContentRefFile | ContentRefURL };
        })(),
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
