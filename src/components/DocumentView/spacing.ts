import { DocumentBlockListItem, DocumentBlocksEssentials } from '@gitbook/api';
import { assertNever } from 'assert-never';

import { ClassValue } from '@/lib/tailwind';

/**
 * Get the line height of a block
 */
export function getBlockTextStyle(block: DocumentBlocksEssentials | DocumentBlockListItem): {
    /** Tailwind class for the text size */
    textSize: ClassValue;
    /** Tailwind class for the height (h-*) */
    lineHeight: ClassValue;
} {
    switch (block.type) {
        case 'paragraph':
            return {
                textSize: ['text-base'],
                lineHeight: 'h-6',
            };
        case 'heading-1':
            return {
                textSize: ['text-3xl', 'font-semibold'],
                lineHeight: 'h-9',
            };
        case 'heading-2':
            return {
                textSize: ['text-2xl', 'font-semibold'],
                lineHeight: 'h-8',
            };
        case 'heading-3':
            return {
                textSize: ['text-base', 'font-semibold'],
                lineHeight: 'h-6',
            };
        case 'divider':
            return {
                textSize: [],
                lineHeight: 'h-6',
            };
        case 'list-ordered':
        case 'list-tasks':
        case 'list-unordered':
            return getBlockTextStyle(block.nodes[0]);
        case 'list-item':
            return getBlockTextStyle(block.nodes[0]);
        default:
            assertNever(block);
    }
}
