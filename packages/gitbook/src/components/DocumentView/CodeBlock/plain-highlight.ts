import type { CustomizationThemedCodeTheme, DocumentBlockCode } from '@gitbook/api';

import { getNodeText } from '@/lib/document';
import { bundledThemesInfo } from 'shiki/themes';
import { customThemes } from './customThemes';
import type { HighlightTheme, HighlightToken, RenderedInline } from './highlight';

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

    // Resolve theme objects: first check bundled Shiki themes, then custom themes, finally fallback to type-only
    // The type-only fallback ensures HighlightTheme always has valid theme objects even when theme names don't match
    const themes = {
        light: bundledThemesInfo.find((theme) => theme.id === options?.themes?.light) ??
            Object.values(customThemes).find((theme) => theme.name === options?.themes?.light) ?? {
                type: 'light',
            },
        dark: bundledThemesInfo.find((theme) => theme.id === options?.themes?.dark) ??
            Object.values(customThemes).find((theme) => theme.name === options?.themes?.dark) ?? {
                type: 'dark',
            },
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

            return {
                highlighted: Boolean(lineBlock.data.highlighted),
                tokens,
            };
        }),
    };
}
