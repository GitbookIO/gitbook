import { DocumentBlock, JSONDocument } from '@gitbook/api';
import memoize from 'memoizee/weak';

/**
 * Estimate if a block will be offscreen or not.
 * It should be used to lazy load resources for blocks that are offscreen.
 */
export function isBlockOffscreen(
    {
        block,
        document,
        ancestorBlocks,
    }: {
        document: JSONDocument;
        block: DocumentBlock;
        ancestorBlocks: DocumentBlock[];
    },
    screenHeight: number = 500,
): boolean {
    let current = block;

    const allAncestors = [document, ...ancestorBlocks];
    for (let index = allAncestors.length - 1; index >= 0; index--) {
        const parent = allAncestors[index];
        const offset = getBlockOffset({ block: current, parent });

        if (offset > screenHeight) {
            return true;
        }

        if (parent.object === 'document') {
            break;
        }
        current = parent;
    }

    return false;
}

/**
 * Estimate the offset of a block in its parent.
 */
function getBlockOffset({
    block,
    parent,
}: {
    block: DocumentBlock;
    parent: DocumentBlock | JSONDocument;
}): number {
    if (!('nodes' in parent)) {
        return 0;
    }

    let offset = 0;

    for (const node of parent.nodes) {
        if (node === block) {
            break;
        }

        if (node.object === 'block') {
            offset += getBlockHeight(node);
        }
    }

    return offset;
}

const getBlockHeight = memoize((block: DocumentBlock | undefined): number => {
    if (!block) {
        return 0;
    }

    switch (block.type) {
        case 'heading-1':
            return 60;
        case 'heading-2':
            return 50;
        case 'heading-3':
            return 40;
        case 'paragraph':
            return 30;
        case 'divider':
            return 20;
        case 'code':
            return block.nodes.length * 25;
        case 'blockquote':
        case 'hint':
            return getBlockHeights(block.nodes);
        case 'drawing':
        case 'embed':
        case 'images':
        case 'image':
        case 'swagger':
            return 768 / (16 / 9);
        case 'file':
        case 'expandable':
        case 'math':
            return 100;
        case 'table':
            return Object.keys(block.data.records).length * 25;
        case 'tabs':
            return getBlockHeight(block.nodes[0]);
        case 'tabs-item':
            return getBlockHeights(block.nodes);
        case 'list-ordered':
        case 'list-tasks':
        case 'list-unordered':
            return getBlockHeights(block.nodes);
        case 'list-item':
            return getBlockHeights(block.nodes);
        default:
            return 30;
    }
});

const getBlockHeights = memoize((blocks: DocumentBlock[]): number => {
    return blocks.reduce((total, block) => total + getBlockHeight(block), 0);
});
