import {
    DocumentText,
    DocumentInline,
    DocumentFragment,
    JSONDocument,
    DocumentBlock,
} from '@gitbook/api';

export interface DocumentSection {
    id: string;
    title: string;
    depth: number;
}

/**
 * Check if the document contains one block that should be rendered in full-width mode.
 */
export function hasFullWidthBlock(document: JSONDocument): boolean {
    return document.nodes.some((node) => {
        return node.data && 'fullWidth' in node.data && node.data.fullWidth;
    });
}

/**
 * Extract a list of sections from a document.
 */
export function getDocumentSections(document: JSONDocument): DocumentSection[] {
    const sections: DocumentSection[] = [];
    let depth = 0;

    document.nodes.forEach((block) => {
        if (
            block.type === 'heading-1' ||
            block.type === 'heading-2' ||
            block.type === 'heading-3'
        ) {
            if (block.type === 'heading-1') {
                depth = 1;
            }
            const title = getNodeText(block);
            const id = block.meta?.id ?? title;

            sections.push({
                id,
                title,
                depth: block.type === 'heading-1' ? 1 : depth > 0 ? 2 : 1,
            });
        }
    });

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
            throw new Error('Invalid node');
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
    node: DocumentText | DocumentFragment | DocumentInline | DocumentBlock,
): boolean {
    const text = getNodeText(node);
    return text.trim().length === 0;
}
