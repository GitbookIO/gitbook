import type { DocumentBlockCodeLine } from '@gitbook/api';

/**
 * Common interface for a slim code line.
 */
interface SlimDocumentBlockCodeLineCommon
    extends Omit<DocumentBlockCodeLine, 'nodes' | 'data' | 'key'> {
    highlighted?: true;
}

/**
 * Code line with text only.
 */
export interface SlimDocumentBlockCodeLineText extends SlimDocumentBlockCodeLineCommon {
    text: string;
}

/**
 * Code line with annotations.
 */
export interface SlimDocumentBlockCodeLineAnnotated extends SlimDocumentBlockCodeLineCommon {
    nodes: DocumentBlockCodeLine['nodes'];
}

/**
 * Slim version of a DocumentBlockCodeLine.
 */
export type SlimDocumentBlockCodeLine =
    | SlimDocumentBlockCodeLineText
    | SlimDocumentBlockCodeLineAnnotated;

/**
 * Transform a DocumentBlockCodeLine into a slim version.
 */
export function transform(block: DocumentBlockCodeLine): SlimDocumentBlockCodeLine {
    let hasTextOnly = true;
    const text = block.nodes.reduce((acc, node) => {
        if (node.object === 'text') {
            return acc + node.leaves.map((leaf) => leaf.text).join('');
        }
        hasTextOnly = false;
        return acc;
    }, '');
    const slimNode: SlimDocumentBlockCodeLine = hasTextOnly
        ? { type: block.type, object: block.object, text, isVoid: block.isVoid }
        : {
              nodes: block.nodes,
              type: block.type,
              object: block.object,
              isVoid: block.isVoid,
          };
    if (block.data.highlighted) {
        slimNode.highlighted = true;
    }
    return slimNode;
}
