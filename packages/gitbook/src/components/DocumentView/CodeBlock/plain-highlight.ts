import { getNodeText } from '@/lib/document';

import type { SlimDocumentBlockCode } from '@/lib/slim-document';
import assertNever from 'assert-never';
import type { HighlightLine, HighlightToken, RenderedInline } from './highlight';

/**
 * Parse a code block without highlighting it.
 */
export function plainHighlight(args: {
    inlines: RenderedInline[];
    block: SlimDocumentBlockCode;
}): HighlightLine[] {
    const { inlines, block } = args;
    const inlinesCopy = Array.from(inlines);
    return block.nodes.map((node) => {
        const tokens: HighlightToken[] = (() => {
            if ('text' in node) {
                return [
                    {
                        type: 'plain',
                        content: node.text,
                    },
                ];
            }
            if ('nodes' in node) {
                return node.nodes.map((node) => {
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
            }
            assertNever(node);
        })();

        return {
            highlighted: Boolean(node.highlighted),
            tokens,
        };
    });
}
