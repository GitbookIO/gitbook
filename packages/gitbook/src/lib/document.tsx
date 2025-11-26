import { Emoji } from '@/components/primitives';
import type {
    DocumentBlock,
    DocumentBlockHeading,
    DocumentFragment,
    DocumentInline,
    DocumentText,
    JSONDocument,
} from '@gitbook/api';
import assertNever from 'assert-never';
import { Fragment } from 'react';

export interface DocumentSection {
    id: string;
    tag?: string;
    title: string;
    depth: number;
}

/**
 * Check if the document contains one block that should be rendered in full-width mode.
 */
export function hasFullWidthBlock(document: JSONDocument): boolean {
    for (const node of document.nodes) {
        if (node.data && 'fullWidth' in node.data && node.data.fullWidth) {
            return true;
        }
        if (node.type === 'swagger' || node.type === 'openapi-operation') {
            return true;
        }
    }

    return false;
}

/**
 * Returns true if the document has more than `limit` blocks and/or inlines that match the `check` predicate.
 */
export function hasMoreThan(
    document: JSONDocument | DocumentBlock,
    check: (block: DocumentBlock | DocumentInline) => boolean,
    limit = 1
): boolean {
    let count = 0;

    function traverse(node: JSONDocument | DocumentBlock | DocumentFragment): boolean {
        for (const child of 'nodes' in node ? node.nodes : []) {
            if (child.object === 'text') continue;

            if (check(child)) {
                count++;
                if (count > limit) return true;
            }

            if (child.object === 'block' && 'nodes' in child) {
                if (traverse(child)) return true;
            }

            if (child.object === 'block' && 'fragments' in child) {
                for (const fragment of child.fragments) {
                    if (traverse(fragment)) return true;
                }
            }
        }
        return false;
    }

    return traverse(document);
}

/**
 * Get the text of a block/inline.
 */
export function getNodeText(
    node: JSONDocument | DocumentText | DocumentFragment | DocumentInline | DocumentBlock
): string {
    switch (node.object) {
        case 'text':
            return node.leaves.map((leaf) => leaf.text).join('');
        case 'document':
        case 'fragment':
        case 'block':
        case 'inline':
            if (!('nodes' in node)) {
                return '';
            }

            return node.nodes.map((child) => getNodeText(child)).join('');
        default:
            assertNever(node);
    }
}

/**
 * Get the text of a block/inline as ReactNode.
 */
export function getNodeReactText(
    node: JSONDocument | DocumentText | DocumentFragment | DocumentInline | DocumentBlock
): React.ReactNode {
    if (node.object === 'inline' && node.type === 'emoji') {
        return <Emoji code={node.data.code} />;
    }

    if (node.object === 'text') {
        return getNodeText(node);
    }

    if (!('nodes' in node)) {
        return null;
    }

    return node.nodes.map((child, index) => {
        return <Fragment key={child.key ?? `idx-${index}`}>{getNodeReactText(child)}</Fragment>;
    });
}

/**
 * Get a fragment by its type in a node.
 */
export function getNodeFragmentByType(
    node: DocumentInline | DocumentBlock,
    type: string
): DocumentFragment | null {
    if (!('fragments' in node)) {
        return null;
    }
    const fragment = node.fragments.find((child: any) => child.type === type);
    return fragment ?? null;
}

/**
 * Get a fragment by its `fragment` name in a node.
 */
export function getNodeFragmentByName(
    node: DocumentInline | DocumentBlock,
    name: string
): DocumentFragment | null {
    if (!('fragments' in node)) {
        return null;
    }
    const fragment = node.fragments?.find((child: any) => child.fragment === name);
    return fragment ?? null;
}

/**
 * Test if a node is empty.
 */
export function isNodeEmpty(
    node: DocumentText | DocumentFragment | DocumentInline | DocumentBlock | JSONDocument
): boolean {
    if ((node.object === 'block' || node.object === 'inline') && node.isVoid) {
        return false;
    }

    if (node.object !== 'text' && 'nodes' in node) {
        if (node.nodes.length > 1) {
            return false;
        }

        return node.nodes.every((child) => isNodeEmpty(child));
    }

    const text = getNodeText(node);
    return text.trim().length === 0;
}

/**
 * Get the title for a node.
 */
export function getBlockTitle(block: DocumentBlock): string {
    switch (block.type) {
        case 'expandable': {
            const titleFragment = getNodeFragmentByType(block, 'expandable-title');
            if (titleFragment) {
                return getNodeText(titleFragment);
            }
            return '';
        }

        case 'tabs-item': {
            return block.data.title ?? '';
        }

        case 'swagger':
        case 'openapi-operation': {
            return `${block.data.method?.toUpperCase()} ${block.data.path}`;
        }
        default:
            return getNodeText(block);
    }
}

/**
 * Get a block by its ID in the document.
 */
export function getBlockById(document: JSONDocument, id: string): DocumentBlock | null {
    return findBlock(document, (block) => {
        if ('meta' in block && block.meta && 'id' in block.meta) {
            return block.meta.id === id;
        }
        return false;
    });
}

/**
 * Get all block by a type in the document.
 */
export function getBlocksByType<Type extends DocumentBlock['type']>(
    document: JSONDocument,
    type: Type
): Extract<DocumentBlock, { type: Type }>[] {
    return findBlocks(document, (block) => {
        return block.type === type;
    });
}

/**
 * Check if a block is a heading block.
 */
export function isHeadingBlock(block: DocumentBlock): block is DocumentBlockHeading {
    return ['heading-1', 'heading-2', 'heading-3'].includes(block.type);
}

/**
 * Find all blocks by a predicate in the document.
 */
function findBlocks<Block extends DocumentBlock>(
    container: JSONDocument | DocumentBlock | DocumentFragment,
    test: (block: DocumentBlock) => boolean
): Block[] {
    if (!('nodes' in container)) {
        return [];
    }

    const results: Block[] = [];
    for (const block of container.nodes) {
        if (block.object !== 'block') {
            continue;
        }

        if (test(block)) {
            // @ts-expect-error - we know that the block is of type Block
            results.push(block);
        }

        if (block.object === 'block' && 'nodes' in block) {
            const result = findBlocks<Block>(block, test);
            if (result.length > 0) {
                results.push(...result);
            }
        }

        if (block.object === 'block' && 'fragments' in block) {
            for (const fragment of block.fragments) {
                const result = findBlocks<Block>(fragment, test);
                if (result.length > 0) {
                    results.push(...result);
                }
            }
        }
    }

    return results;
}

/**
 * Find a block by a predicate in the document.
 */
function findBlock(
    container: JSONDocument | DocumentBlock | DocumentFragment,
    test: (block: DocumentBlock) => boolean
): DocumentBlock | null {
    if (!('nodes' in container)) {
        return null;
    }

    for (const block of container.nodes) {
        if (block.object !== 'block') {
            return null;
        }

        if (test(block)) {
            return block;
        }

        if (block.object === 'block' && 'nodes' in block) {
            const result = findBlock(block, test);
            if (result) {
                return result;
            }
        }

        if (block.object === 'block' && 'fragments' in block) {
            for (const fragment of block.fragments) {
                const result = findBlock(fragment, test);
                if (result) {
                    return result;
                }
            }
        }
    }

    return null;
}
