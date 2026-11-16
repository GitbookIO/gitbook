import type { DocumentBlock } from '@gitbook/api';

/**
 * Text style of a block's first line. Elements aligned on it (list prefixes, hint icons) pick
 * their size and line height from it, via the matching modifier classes in `styles/blocks.css`.
 */
export type BlockTextKind = 'body' | 'heading-1' | 'heading-2' | 'heading-3' | 'divider';

export function getBlockTextKind(block: DocumentBlock): BlockTextKind {
    switch (block.type) {
        case 'heading-1':
        case 'heading-2':
        case 'heading-3':
        case 'divider':
            return block.type;
        case 'list-ordered':
        case 'list-tasks':
        case 'list-unordered':
        case 'list-item':
            return getBlockTextKind(block.nodes[0]!);
        default:
            return 'body';
    }
}

/**
 * Line height utility of each text kind.
 */
export const BLOCK_LINE_HEIGHT: Record<BlockTextKind, string> = {
    body: 'leading-normal',
    'heading-1': 'leading-tight',
    'heading-2': 'leading-snug',
    'heading-3': 'leading-snug',
    divider: 'leading-none',
};
