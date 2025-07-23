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
            return ['text-start', 'justify-self-start'];
        case TextAlignment.Center:
            return ['text-center', 'justify-self-center'];
        case TextAlignment.End:
            return ['text-end', 'justify-self-end'];
        default:
            return nullIfNever(textAlignment);
    }
}
