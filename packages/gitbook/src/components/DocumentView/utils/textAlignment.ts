import { TextAlignment } from '@gitbook/api';

import './textAlignment.css';
import type { ClassValue } from '@/lib/tailwind';
import { nullIfNever } from '@/lib/typescript';

/**
 * Get the tailwind class for a text alignment.
 * Each alignment packs three utilities, so it is a single class from `textAlignment.css`.
 */
export function getTextAlignment(textAlignment: TextAlignment | undefined): ClassValue {
    switch (textAlignment) {
        case undefined:
        case TextAlignment.Start:
            return 'gb-align-start';
        case TextAlignment.Center:
            return 'gb-align-center';
        case TextAlignment.End:
            return 'gb-align-end';
        default:
            return nullIfNever(textAlignment);
    }
}
