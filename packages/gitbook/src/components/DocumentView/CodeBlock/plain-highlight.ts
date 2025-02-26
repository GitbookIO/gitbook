import type { DocumentBlockCode } from '@gitbook/api';

import { getNodeText } from '@/lib/document';

import type { HighlightLine, HighlightToken, RenderedInline } from './highlight';

/**
 * Parse a code block without highlighting it.
 */
export function plainHighlight(
    block: DocumentBlockCode,
    inlines: RenderedInline[]
): HighlightLine[] {
    const inlinesCopy = Array.from(inlines);
    return block.nodes.map((lineBlock) => {
        const tokens: HighlightToken[] = lineBlock.nodes.map((node) => {
            if (node.object === 'text') {
                return {
                    type: 'plain',
                    content: getNodeText(node),
                };
            }
            const inline = inlinesCopy.shift();
            return {
                type: 'annotation',
                body: inline?.body ?? null,
                children: [
                    {
                        type: 'plain',
                        content: getNodeText(node),
                    },
                ],
            };
        });

        return {
            highlighted: Boolean(lineBlock.data.highlighted),
            tokens,
        };
    });
}
