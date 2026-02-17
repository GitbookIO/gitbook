import {
    CustomizationCodeTheme,
    type CustomizationThemedCodeTheme,
    type DocumentBlockCode,
    type DocumentBlockCodeLine,
    type DocumentInlineAnnotation,
} from '@gitbook/api';
import {
    type ThemeRegistrationAny,
    type ThemedToken,
    createSingletonShorthands,
    createdBundledHighlighter,
} from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { type BundledLanguage, bundledLanguages } from 'shiki/langs';
import { bundledThemes } from 'shiki/themes';

import { nullIfNever } from '@/lib/typescript';
import { customThemes } from './customThemes';
import { plainHighlight } from './plain-highlight';

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

export type HighlightLine = {
    highlighted: boolean;
    tokens: HighlightToken[];
};

export type HighlightToken =
    | { type: 'plain'; content: string }
    | { type: 'shiki'; token: ThemedToken }
    | { type: 'annotation'; body: React.ReactNode; children: HighlightToken[] };

export type InlineIndexed = { inline: any; start: number; end: number };

type PositionedToken = ThemedToken & { start: number; end: number };

export type RenderedInline = {
    inline: InlineIndexed;
    body: React.ReactNode;
};

// Merge bundled Shiki themes with our custom themes so both are available to the highlighter
const { getSingletonHighlighter } = createSingletonShorthands(
    createdBundledHighlighter<any, any>({
        langs: bundledLanguages,
        themes: { ...bundledThemes, ...customThemes },
        engine: () => createJavaScriptRegexEngine({ forgiving: true, target: 'ES2018' }),
    })
);

/**
 * Preload the highlighter for a code block.
 */
export async function preloadHighlight(
    block: DocumentBlockCode,
    themes: CustomizationThemedCodeTheme = DEFAULT_THEMES
) {
    const langName = getBlockLang(block);
    if (langName) {
        await getSingletonHighlighter({
            langs: [langName],
            themes: [themes.light, themes.dark],
        });
    }
}

/**
 * Highlight a code block while preserving inline elements.
 */
export async function highlight(
    block: DocumentBlockCode,
    inlines: RenderedInline[],
    options?: {
        evaluateInlineExpression?: (expr: string) => string;
        themes?: CustomizationThemedCodeTheme;
    }
): Promise<HighlightTheme> {
    const langName = getBlockLang(block);

    if (!langName) {
        // Fallback to plain highlighting if language is not found
        return plainHighlight(block, inlines, options);
    }

    const themes = options?.themes ?? DEFAULT_THEMES;

    const code = getPlainCodeBlock(block, undefined, options);

    const highlighter = await getSingletonHighlighter({
        langs: [langName],
        themes: [themes.light, themes.dark],
    });

    const resolvedThemes = {
        light: highlighter.getTheme(themes.light),
        dark: highlighter.getTheme(themes.dark),
    };

    let tokenizeMaxLineLength = 400;
    // In some cases, people will use unindented code blocks with a single line.
    // In this case, we can safely increase the max line length to avoid not highlighting the code.
    if (block.nodes.length === 1) {
        tokenizeMaxLineLength = 5000;
    }

    const result = highlighter.codeToTokens(code, {
        lang: langName,
        themes: resolvedThemes,
        // Shiki's light-dark() CSS function provides different colors for light/dark modes based on the resolved themes
        defaultColor: 'light-dark()',
        tokenizeMaxLineLength,
    });

    const lines = result.tokens;

    let currentIndex = 0;
    return {
        bg: result.bg,
        fg: result.fg,
        themes: resolvedThemes,
        lines: lines.map((tokens, index) => {
            const lineBlock = block.nodes[index];
            const result: HighlightToken[] = [];

            const eatToken = (): PositionedToken | null => {
                const token = tokens.shift();
                if (token) {
                    currentIndex += token.content.length;
                }
                return token
                    ? { ...token, start: currentIndex - token.content.length, end: currentIndex }
                    : null;
            };

            while (tokens.length > 0) {
                result.push(...matchTokenAndInlines(eatToken, inlines));
            }

            currentIndex += 1; // for the \n

            return {
                highlighted: Boolean(lineBlock?.data.highlighted),
                tokens: result,
            };
        }),
    };
}

/**
 * Get the language of a code block.
 */
function getBlockLang(block: DocumentBlockCode): string | null {
    return block.data.syntax ? getLanguageForSyntax(block.data.syntax) : null;
}

const syntaxAliases: Record<string, BundledLanguage> = {
    // "Parser" language does not exist in Shiki, but it's used in GitBook
    // The closest language is "Blade"
    parser: 'blade',

    // From GitBook App we receive "objectivec" instead of "objective-c"
    objectivec: 'objective-c',
};

function checkIsBundledLanguage(lang: string): lang is BundledLanguage {
    return lang in bundledLanguages;
}

/**
 * Validate a language name.
 */
function getLanguageForSyntax(syntax: string): BundledLanguage | null {
    // Normalize the syntax to lowercase.
    syntax = syntax.toLowerCase();

    // Check if the syntax is a bundled language.
    if (checkIsBundledLanguage(syntax)) {
        return syntax;
    }

    // Check if there is a valid alias for the syntax.
    const alias = syntaxAliases[syntax];
    if (alias && checkIsBundledLanguage(alias)) {
        return alias;
    }

    return null;
}

export function getInlines(block: DocumentBlockCode) {
    const inlines: InlineIndexed[] = [];
    getPlainCodeBlock(block, inlines);

    inlines.sort((a, b) => a.start - b.start);

    return inlines;
}

function matchTokenAndInlines(
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
