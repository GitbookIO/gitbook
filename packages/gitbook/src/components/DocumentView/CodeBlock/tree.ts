import type { DocumentBlockCode, DocumentInlineAnnotation, DocumentText } from '@gitbook/api';

export type LightNode = (
    | {
          text: string;
      }
    | {
          nodes: (DocumentText | DocumentInlineAnnotation)[];
      }
) & {
    highlighted?: boolean;
};

/**
 * Get a light representation of a code block.
 * To reduce the payload size sent to the client we only send the minimal
 * information needed to render the code block.
 */
export function getLightNodes(block: DocumentBlockCode): LightNode[] {
    return block.nodes.map((node) => {
        let hasTextOnly = true;
        const text = node.nodes.reduce((acc, node) => {
            if (node.object === 'text') {
                return acc + node.leaves.map((leaf) => leaf.text).join('');
            }
            hasTextOnly = false;
            return acc;
        }, '');
        const lightNode: LightNode = hasTextOnly ? { text } : { nodes: node.nodes };
        if (node.data.highlighted) {
            lightNode.highlighted = true;
        }
        return lightNode;
    });
}
