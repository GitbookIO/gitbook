import type { CustomizationThemedCodeTheme, DocumentBlockCode } from '@gitbook/api';

import { getNodeText } from '@/lib/document';
import {
    type HighlightTheme,
    type HighlightToken,
    type RenderedInline,
    getHighlightTokensText,
    parseDiffNotation,
    truncateHighlightTokens,
} from './highlight-tokens';

/**
 * Parse a code block without highlighting it.
 */
export function plainHighlight(
    block: DocumentBlockCode,
    inlines: RenderedInline[],
    options?: {
        evaluateInlineExpression?: (expr: string) => string;
        themes?: CustomizationThemedCodeTheme;
    }
): HighlightTheme {
    const inlinesCopy = Array.from(inlines);

    // Plain code only needs the declared color mode. The full theme is loaded with Shiki in the browser.
    const themes = {
        light: { type: 'light' as const },
        dark: { type: 'dark' as const },
    };

    return {
        themes: themes,
        lines: block.nodes.map((lineBlock) => {
            const tokens: HighlightToken[] = lineBlock.nodes.map((node) => {
                if (node.object === 'text') {
                    return {
                        type: 'plain',
                        content: getNodeText(node),
                    };
                }

                if (node.type === 'expression') {
                    return {
                        type: 'plain',
                        content: options?.evaluateInlineExpression?.(node.data.expression) ?? '',
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

            // Detect diff notation against the built tokens (not the raw nodes)
            // so any evaluated inline expressions are included in the offset math.
            const notation = parseDiffNotation(getHighlightTokensText(tokens));

            return {
                highlighted: Boolean(lineBlock.data.highlighted),
                diff: notation?.diff ?? null,
                tokens: notation ? truncateHighlightTokens(tokens, notation.markerStart) : tokens,
            };
        }),
    };
}
