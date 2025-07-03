import type { ClassValue } from '@/lib/tailwind';
import { nullIfNever } from '@/lib/typescript';
import { type DocumentBlock, TextAlignment } from '@gitbook/api';

/**
 * Get the tailwind class for a text alignment.
 */
export function getTextAlignment(
    textAlignment: TextAlignment | undefined,
    ancestorBlocks: DocumentBlock[]
): ClassValue {
    // Text nodes within a table will have their alignment governed by columns instead.)
    for (let i = ancestorBlocks.length - 1; i >= 0; i--) {
        const ancestor = ancestorBlocks[i];
        if (ancestor.type === 'table') {
            return null;
        }
    }

    // If not inside a table, use the normal alignment logic
    switch (textAlignment) {
        case undefined:
        case TextAlignment.Start:
            return ['text-start', 'justify-self-start'];
        case TextAlignment.Center:
            return ['text-center', 'justify-self-center'];
        case TextAlignment.End:
            return ['text-end', 'justify-self-end'];
        default:
            return nullIfNever(textAlignment);
    }
}
