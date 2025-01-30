import { DocumentBlockCode } from '@gitbook/api';

import { getNodeText } from '@/lib/document-util';

import type { HighlightLine, HighlightToken, RichInlineIndexed } from './highlight';

/**
 * Parse a code block without highlighting it.
 */
export function plainHighlight(
    block: DocumentBlockCode,
    inlines?: RichInlineIndexed[],
): HighlightLine[] {
    const inlinesCopy = Array.from(inlines ?? []);
    return block.nodes.map((lineBlock) => {
        const tokens: HighlightToken[] = [];

        for (const node of lineBlock.nodes) {
            if (node.object === 'text') {
                tokens.push({
                    type: 'plain',
                    content: getNodeText(node),
                });
            } else {
                const inline = inlinesCopy.shift();
                tokens.push({
                    type: 'annotation',
                    body: inline?.body ?? null,
                    children: [
                        {
                            type: 'plain',
                            content: getNodeText(node),
                        },
                    ],
                });
            }
        }

        return {
            highlighted: !!lineBlock.data.highlighted,
            tokens,
        };
    });
}
