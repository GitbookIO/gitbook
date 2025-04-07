import type { DocumentInlineAnnotation } from '@gitbook/api';
import {
    type ThemedToken,
    createCssVariablesTheme,
    createSingletonShorthands,
    createdBundledHighlighter,
} from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { type BundledLanguage, bundledLanguages } from 'shiki/langs';

import { plainHighlight } from './plain-highlight';
import type { LightNode } from './tree';

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

const theme = createCssVariablesTheme();

const { getSingletonHighlighter } = createSingletonShorthands(
    createdBundledHighlighter<any, any>({
        langs: bundledLanguages,
        themes: {},
        engine: () => createJavaScriptRegexEngine({ forgiving: true, target: 'ES2018' }),
    })
);

/**
 * Preload the highlighter for a code block.
 */
export async function preloadHighlight(syntax: string | undefined): Promise<void> {
    const langName = getLanguageFromSyntax(syntax);
    if (langName) {
        await getSingletonHighlighter({
            langs: [langName],
            themes: [theme],
        });
    }
}

/**
 * Highlight a code block while preserving inline elements.
 */
export async function highlight(args: {
    syntax: string | undefined;
    inlines: RenderedInline[];
    lightNodes: LightNode[];
    // block: DocumentBlockCode,
}): Promise<HighlightLine[]> {
    const { syntax, inlines, lightNodes } = args;
    const langName = getLanguageFromSyntax(syntax);
    if (!langName) {
        // Language not found, fallback to plain highlighting
        return plainHighlight({ syntax, inlines, lightNodes });
    }

    const code = getPlainCodeBlock(lightNodes);

    const highlighter = await getSingletonHighlighter({
        langs: [langName],
        themes: [theme],
    });

    const lines = highlighter.codeToTokensBase(code, {
        lang: langName,
        theme,
        tokenizeMaxLineLength: 400,
    });

    let currentIndex = 0;
    return lines.map((tokens, index) => {
        const lightNode = lightNodes[index];
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
            highlighted: Boolean(lightNode.highlighted),
            tokens: result,
        };
    });
}

/**
 * Get the language of a code block.
 */
function getLanguageFromSyntax(syntax: string | undefined): string | null {
    return syntax ? getLanguageForSyntax(syntax) : null;
}

const syntaxAliases: Record<string, BundledLanguage> = {
    // "Parser" language does not exist in Shiki, but it's used in GitBook
    // The closest language is "Blade"
    parser: 'blade',
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

export function getInlines(lightNodes: LightNode[]): InlineIndexed[] {
    const inlines: InlineIndexed[] = [];
    getPlainCodeBlock(lightNodes, inlines);

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

function getPlainCodeBlock(lightNodes: LightNode[], inlines?: InlineIndexed[]): string {
    let content = '';

    lightNodes.forEach((node, index) => {
        const lineContent = getPlainCodeBlockLine(node, content.length, inlines);
        content += lineContent;

        if (index < lightNodes.length - 1) {
            content += '\n';
        }
    });

    return content;
}

function getPlainCodeBlockLine(
    parent: LightNode | DocumentInlineAnnotation,
    index: number,
    inlines?: InlineIndexed[]
): string {
    let content = '';

    if ('text' in parent && parent.text) {
        return cleanupLine(parent.text);
    }

    if ('nodes' in parent && parent.nodes) {
        for (const node of parent.nodes) {
            if (node.object === 'text') {
                content += cleanupLine(node.leaves.map((leaf) => leaf.text).join(''));
            } else {
                const start = index + content.length;
                content += getPlainCodeBlockLine(node, index + content.length, inlines);
                const end = index + content.length;

                if (inlines) {
                    inlines.push({
                        inline: node,
                        start,
                        end,
                    });
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
