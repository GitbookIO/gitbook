import {
    DocumentText,
    DocumentInline,
    DocumentFragment,
    JSONDocument,
    DocumentBlock,
    ContentRef,
} from '@gitbook/api';
import assertNever from 'assert-never';

import { fetchOpenAPIBlock } from './openapi';
import { ResolvedContentRef } from './references';

export interface DocumentSection {
    id: string;
    tag?: string;
    title: string;
    depth: number;
}

/**
 * Check if the document contains one block that should be rendered in full-width mode.
 */
export function hasFullWidthBlock(document: JSONDocument): { apiBlock: boolean } | false {
    let fullWidth = false;

    for (const node of document.nodes) {
        if (node.data && 'fullWidth' in node.data && node.data.fullWidth) {
            fullWidth = true;
        }

        if (node.type === 'swagger') {
            return { apiBlock: true };
        }
    }

    return fullWidth ? { apiBlock: false } : false;
}

/**
 * Extract a list of sections from a document.
 */
export async function getDocumentSections(
    document: JSONDocument,
    resolveContentRef: (ref: ContentRef) => Promise<ResolvedContentRef | null>,
): Promise<DocumentSection[]> {
    const sections: DocumentSection[] = [];
    let depth = 0;

    for (const block of document.nodes) {
        if (
            (block.type === 'heading-1' ||
                block.type === 'heading-2' ||
                block.type === 'heading-3') &&
            block.meta?.id
        ) {
            if (block.type === 'heading-1') {
                depth = 1;
            }
            const title = getNodeText(block);
            const id = block.meta?.id;

            sections.push({
                id,
                title,
                depth: block.type === 'heading-1' ? 1 : depth > 0 ? 2 : 1,
            });
        }

        if (block.type === 'swagger' && block.meta?.id) {
            const operation = await fetchOpenAPIBlock(block, resolveContentRef);
            if (operation) {
                sections.push({
                    id: block.meta.id,
                    tag: operation.method.toUpperCase(),
                    title: operation.operation.summary ?? operation.path,
                    depth: 1,
                });
            }
        }
    }

    return sections;
}

/**
 * Get the text of a block/inline.
 */
export function getNodeText(
    node: DocumentText | DocumentFragment | DocumentInline | DocumentBlock,
): string {
    switch (node.object) {
        case 'text':
            return node.leaves.map((leaf) => leaf.text).join('');
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
    node: DocumentInline | DocumentBlock,
    type: string,
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
    name: string,
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
    node: DocumentText | DocumentFragment | DocumentInline | DocumentBlock | JSONDocument,
): boolean {
    if (node.object !== 'text' && 'nodes' in node) {
        if (node.nodes.length > 0) {
            return false;
        }

        return node.nodes.every((child) => isNodeEmpty(child));
    }

    const text = getNodeText(node);
    return text.trim().length === 0;
}
