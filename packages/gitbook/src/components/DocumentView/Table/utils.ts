import type { DocumentContext } from '@/components/DocumentView/DocumentView';
import { resolveContentRef } from '@/lib/references';
import type {
    DocumentTableDefinition,
    DocumentTableRecord,
    TableRecordValueImage,
} from '@gitbook/api';
import assertNever from 'assert-never';

/**
 * Get the value for a column in a record.
 */
export function getRecordValue<T extends DocumentTableRecord['values'][string]>(
    record: DocumentTableRecord,
    definitionId: string
): T {
    // @ts-ignore
    return record.values[definitionId];
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
 * Check if a column definition is an image.
 */

export function isImageDefition(
    record: DocumentTableRecord['values'][string]
): record is TableRecordValueImage {
    return !!record && typeof record === 'object' && 'src' in record;
}

/**
 * Get the image value for a column.
 */
export async function resolveTableImageValue(props: {
    value: TableRecordValueImage | string[];
    context: DocumentContext;
}) {
    const { value, context } = props;

    // If the cover is an image, resolve the light and dark images
    if (isImageDefition(value) && context.contentContext) {
        const [light, dark] = await Promise.all([
            resolveContentRef(value.src, context.contentContext),
            value.srcDark ? resolveContentRef(value.srcDark, context.contentContext) : undefined,
        ]);

        // If the light image is not resolved, we can't display the cover
        if (!light) {
            return null;
        }

        return {
            light,
            dark,
        };
    }
}
