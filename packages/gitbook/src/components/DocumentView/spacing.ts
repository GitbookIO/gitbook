import {
    DocumentBlock,
    DocumentBlockCode,
    DocumentBlockListItem,
    DocumentBlocksEssentials,
} from '@gitbook/api';
import { assertNever } from 'assert-never';

/**
 * Get the line height of a block
 */
export function getBlockTextStyle(block: DocumentBlock): {
    /** Tailwind class for the text size */
    textSize: string;
    /** Tailwind class for the height (h-*) */
    lineHeight: string;
    /** Tailwind class for the margin top (mt-*) */
    marginTop?: string;
} {
    switch (block.type) {
        case 'paragraph':
            return {
                textSize: 'text-base',
                lineHeight: 'leading-normal',
            };
        case 'heading-1':
            return {
                textSize: 'text-3xl font-semibold',
                lineHeight: 'leading-tight',
                marginTop: 'mt-[1em]',
            };
        case 'heading-2':
            return {
                textSize: 'text-2xl font-semibold',
                lineHeight: 'leading-snug',
                marginTop: 'mt-[0.75em]',
            };
        case 'heading-3':
            return {
                textSize: 'text-base font-semibold',
                lineHeight: 'leading-snug',
                marginTop: 'mt-[0.5em]',
            };
        case 'divider':
            return {
                textSize: '',
                lineHeight: 'leading-none',
            };
        case 'list-ordered':
        case 'list-tasks':
        case 'list-unordered':
            return getBlockTextStyle(block.nodes[0]);
        case 'list-item':
            return getBlockTextStyle(block.nodes[0]);
        default:
            return {
                textSize: 'text-base',
                lineHeight: 'leading-normal',
            };
    }
}
