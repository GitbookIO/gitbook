import type { DocumentFragment, DocumentInline, DocumentText } from '@gitbook/api';
import assertNever from 'assert-never';
import type { SlimDocumentBlock, SlimJSONDocument } from './slim-document';

export interface DocumentSection {
    id: string;
    tag?: string;
    title: string;
    depth: number;
}

/**
 * Check if the document contains one block that should be rendered in full-width mode.
 */
export function hasFullWidthBlock(document: SlimJSONDocument): boolean {
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
 * Get the text of a block/inline.
 */
export function getNodeText(
    node: DocumentText | DocumentFragment | DocumentInline | SlimDocumentBlock | SlimJSONDocument
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
 * Get a fragment by its type in a node.
 */
export function getNodeFragmentByType(
    node: DocumentInline | SlimDocumentBlock,
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
    node: DocumentInline | SlimDocumentBlock,
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
    node: DocumentText | DocumentFragment | DocumentInline | SlimJSONDocument | SlimDocumentBlock
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
export function getBlockTitle(block: SlimDocumentBlock): string {
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
export function getBlockById(document: SlimJSONDocument, id: string): SlimDocumentBlock | null {
    return findBlock(document, (block) => {
        if ('meta' in block && block.meta && 'id' in block.meta) {
            return block.meta.id === id;
        }
        return false;
    });
}

/**
 * Find a block by a predicate in the document.
 */
function findBlock(
    container: SlimJSONDocument | SlimDocumentBlock | DocumentFragment,
    test: (block: SlimDocumentBlock) => boolean
): SlimDocumentBlock | null {
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
