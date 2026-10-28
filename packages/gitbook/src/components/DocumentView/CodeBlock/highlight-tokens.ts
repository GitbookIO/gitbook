import type { ThemeRegistrationAny, ThemedToken } from 'shiki/core';

import {
    CustomizationCodeTheme,
    type CustomizationThemedCodeTheme,
    type DocumentBlockCode,
    type DocumentBlockCodeLine,
    type DocumentInlineAnnotation,
} from '@gitbook/api';

import { nullIfNever } from '@/lib/typescript';

// Split from `./highlight` so client code can use these helpers without dragging Shiki's engine
// and language bundles into the initial chunk. Imports from `shiki/core` here must stay type-only.

export const DEFAULT_THEMES: CustomizationThemedCodeTheme = {
    light: CustomizationCodeTheme.DefaultLight,
    dark: CustomizationCodeTheme.DefaultDark,
};

export type HighlightTheme = {
    bg?: string;
    fg?: string;
    themes: {
        light: ThemeRegistrationAny;
        dark: ThemeRegistrationAny;
    };
    lines: HighlightLine[];
};

export type LineDiffNotation = 'added' | 'deleted';

export type HighlightLine = {
    highlighted: boolean;
    diff: LineDiffNotation | null;
    tokens: HighlightToken[];
};

export type HighlightToken =
    | { type: 'plain'; content: string }
    | { type: 'shiki'; token: ThemedToken }
    | { type: 'annotation'; body: React.ReactNode; children: HighlightToken[] };

export type InlineIndexed = { inline: any; start: number; end: number };

export type PositionedToken = ThemedToken & { start: number; end: number };

export type RenderedInline = {
    inline: InlineIndexed;
    body: React.ReactNode;
};

/**
 * Detects an in-source diff notation marker at the end of a line, e.g.
 * `// [!code ++]`, `# [!code --]`, `<!-- [!code ++] -->`, `/* [!code --] *​/`.
 * Mirror of the gitbook-x parser; keep regex byte-for-byte identical.
 */
const NOTATION_PATTERN =
    /[ \t]*(?:(?:\/\/|#|--|;)\s*\[!code\s+(\+\+|--)\]|<!--\s*\[!code\s+(\+\+|--)\]\s*-->|\/\*\s*\[!code\s+(\+\+|--)\]\s*\*\/)\s*$/;

export function parseDiffNotation(
    line: string
): { diff: LineDiffNotation; markerStart: number } | null {
    const match = NOTATION_PATTERN.exec(line);
    if (!match) {
        return null;
    }
    const variant = match[1] ?? match[2] ?? match[3];
    return {
        diff: variant === '++' ? 'added' : 'deleted',
        markerStart: match.index,
    };
}

/**
 * Truncate a sequence of HighlightTokens so only the first `maxLen` characters
 * (counted across all tokens, recursing into annotations) remain. Used to strip
 * trailing diff-notation markers from rendered output.
 */
export function truncateHighlightTokens(
    tokens: HighlightToken[],
    maxLen: number
): HighlightToken[] {
    const out: HighlightToken[] = [];
    let remaining = maxLen;
    for (const token of tokens) {
        if (remaining <= 0) {
            break;
        }
        const len = highlightTokenLength(token);
        if (len <= remaining) {
            out.push(token);
            remaining -= len;
            continue;
        }
        out.push(sliceHighlightToken(token, remaining));
        remaining = 0;
    }
    return out;
}

function highlightTokenLength(token: HighlightToken): number {
    switch (token.type) {
        case 'plain':
            return token.content.length;
        case 'shiki':
            return token.token.content.length;
        case 'annotation':
            return token.children.reduce((acc, child) => acc + highlightTokenLength(child), 0);
    }
}

/**
 * Concatenate the text content of a sequence of HighlightTokens, recursing
 * into annotation children. Mirror of {@link highlightTokenLength}.
 */
export function getHighlightTokensText(tokens: HighlightToken[]): string {
    return tokens
        .map((token) => {
            switch (token.type) {
                case 'plain':
                    return token.content;
                case 'shiki':
                    return token.token.content;
                case 'annotation':
                    return getHighlightTokensText(token.children);
            }
        })
        .join('');
}

function sliceHighlightToken(token: HighlightToken, maxLen: number): HighlightToken {
    switch (token.type) {
        case 'plain':
            return { type: 'plain', content: token.content.slice(0, maxLen) };
        case 'shiki': {
            const inner = token.token as ThemedToken & { start?: number; end?: number };
            const newContent = inner.content.slice(0, maxLen);
            const newToken: ThemedToken & { start?: number; end?: number } = {
                ...inner,
                content: newContent,
            };
            if (typeof inner.start === 'number') {
                newToken.end = inner.start + newContent.length;
            }
            return { type: 'shiki', token: newToken };
        }
        case 'annotation':
            return { ...token, children: truncateHighlightTokens(token.children, maxLen) };
    }
}

export function getInlines(block: DocumentBlockCode) {
    const inlines: InlineIndexed[] = [];
    getPlainCodeBlock(block, inlines);

    inlines.sort((a, b) => a.start - b.start);

    return inlines;
}

export function matchTokenAndInlines(
    eat: () => PositionedToken | null,
    allInlines: RenderedInline[]
): HighlightToken[] {
    const initialToken = eat();
    if (!initialToken) {
        return [];
    }

    const inlines = allInlines.filter(
        ({ inline }) => inline.start >= initialToken.start && inline.start < initialToken.end
    );
    let token = initialToken;
    const result: HighlightToken[] = [];

    const matchAgainstInline = () => {
        const inline = inlines.shift();
        if (!inline) {
            result.push({
                type: 'shiki',
                token,
            });

            return;
        }

        const [before, afterBefore] = splitPositionedTokenAt(token, inline.inline.start);
        if (before) {
            result.push({
                type: 'shiki',
                token: before,
            });
        }
        if (!afterBefore) {
            throw new Error('expect afterBefore to not be empty');
        }

        token = afterBefore;
        const children: HighlightToken[] = [];

        // If shiki token finished before the end of the annotation or the annotation contains multiple tokens
        while (token.end < inline.inline.end) {
            children.push({
                type: 'shiki',
                token: token,
            });

            const next = eat();
            if (!next) {
                throw new Error('expect token to not be empty');
            }
            token = next;
        }

        const [inside, after] = splitPositionedTokenAt(token, inline.inline.end);
        if (!inside) {
            throw new Error('expect inside to not be empty');
        }

        children.push({
            type: 'shiki',
            token: inside,
        });

        result.push({
            type: 'annotation',
            body: inline.body,
            children,
        });

        if (after) {
            token = after;
            matchAgainstInline();
        }
    };

    matchAgainstInline();
    return result;
}

export function getPlainCodeBlock(
    code: DocumentBlockCode,
    inlines?: InlineIndexed[],
    options?: {
        evaluateInlineExpression?: (expr: string) => string;
    }
): string {
    let content = '';

    code.nodes.forEach((node, index) => {
        const lineContent = getPlainCodeBlockLine(node, content.length, inlines, options);
        content += lineContent;

        if (index < code.nodes.length - 1) {
            content += '\n';
        }
    });

    return content;
}

function getPlainCodeBlockLine(
    parent: DocumentBlockCodeLine | DocumentInlineAnnotation,
    index: number,
    inlines?: InlineIndexed[],
    options?: {
        evaluateInlineExpression?: (expr: string) => string;
    }
): string {
    let content = '';

    for (const node of parent.nodes) {
        if (node.object === 'text') {
            content += cleanupLine(node.leaves.map((leaf) => leaf.text).join(''));
        } else {
            switch (node.type) {
                case 'annotation': {
                    const start = index + content.length;
                    content += getPlainCodeBlockLine(
                        node,
                        index + content.length,
                        inlines,
                        options
                    );
                    const end = index + content.length;

                    if (inlines) {
                        inlines.push({
                            inline: node,
                            start,
                            end,
                        });
                    }
                    break;
                }
                case 'expression': {
                    const start = index + content.length;
                    const exprValue =
                        options?.evaluateInlineExpression?.(node.data.expression) ?? '';
                    content += exprValue;
                    const end = start + exprValue.length;

                    if (inlines) {
                        inlines.push({
                            inline: node,
                            start,
                            end,
                        });
                    }
                    break;
                }
                default: {
                    nullIfNever(node);
                    break;
                }
            }
        }
    }

    return content;
}

function slicePositionedToken(
    token: PositionedToken,
    relativeStart: number,
    relativeLength: number
): PositionedToken {
    return {
        ...token,
        start: token.start + relativeStart,
        end: token.start + relativeStart + relativeLength,
        content: token.content.slice(relativeStart, relativeStart + relativeLength),
    };
}

function splitPositionedTokenAt(
    token: PositionedToken,
    absoluteIndex: number
): [PositionedToken | null, PositionedToken | null] {
    if (absoluteIndex < token.start || absoluteIndex > token.end) {
        throw new Error(`index (${absoluteIndex}) out of bound (${token.start}:${token.end})`);
    }

    const before = slicePositionedToken(token, 0, absoluteIndex - token.start);
    const after = slicePositionedToken(
        token,
        absoluteIndex - token.start,
        token.end - absoluteIndex
    );

    return [
        isEmptyPositionedToken(before) ? null : before,
        isEmptyPositionedToken(after) ? null : after,
    ];
}

function isEmptyPositionedToken(token: PositionedToken): boolean {
    return token.start === token.end;
}

/**
 * Currently it's possible for some lines to contain \r characters, we need to remove them
 * as they are considered as new lines by shikijs.
 */
function cleanupLine(line: string): string {
    return line.replace(/\r/g, '');
}
