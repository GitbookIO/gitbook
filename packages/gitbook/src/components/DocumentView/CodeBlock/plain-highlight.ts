import { getNodeText } from '@/lib/document';

import assertNever from 'assert-never';
import type { HighlightLine, HighlightToken, RenderedInline } from './highlight';
import type { LightNode } from './tree';

/**
 * Parse a code block without highlighting it.
 */
export function plainHighlight(args: {
    syntax: string | undefined;
    inlines: RenderedInline[];
    lightNodes: LightNode[];
}): HighlightLine[] {
    const { inlines, lightNodes } = args;
    const inlinesCopy = Array.from(inlines);
    return lightNodes.map((node) => {
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
