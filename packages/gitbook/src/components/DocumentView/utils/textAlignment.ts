import type { ClassValue } from '@/lib/tailwind';
import { nullIfNever } from '@/lib/typescript';
import { TextAlignment } from '@gitbook/api';

/**
 * Get the tailwind class for a text alignment.
 */
export function getTextAlignment(textAlignment: TextAlignment | undefined): ClassValue {
    switch (textAlignment) {
        case undefined:
        case TextAlignment.Start:
            return ['text-start', 'self-start', 'justify-start'];
        case TextAlignment.Center:
            return ['text-center', 'self-center', 'justify-center'];
        case TextAlignment.End:
            return ['text-end', 'self-end', 'justify-end'];
        default:
            return nullIfNever(textAlignment);
    }
}
