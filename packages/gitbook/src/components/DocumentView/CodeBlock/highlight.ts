import { createSingletonShorthands, createdBundledHighlighter } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { type BundledLanguage, bundledLanguages } from 'shiki/langs';
import { bundledThemes } from 'shiki/themes';

import type { CustomizationThemedCodeTheme, DocumentBlockCode } from '@gitbook/api';

import { customThemes } from './customThemes';
import {
    DEFAULT_THEMES,
    type HighlightTheme,
    type HighlightToken,
    type PositionedToken,
    type RenderedInline,
    getPlainCodeBlock,
    matchTokenAndInlines,
    parseDiffNotation,
    truncateHighlightTokens,
} from './highlight-tokens';
import { plainHighlight } from './plain-highlight';

export * from './highlight-tokens';

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

            const lineText = tokens.map((token) => token.content).join('');
            const notation = parseDiffNotation(lineText);

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

            const finalTokens = notation
                ? truncateHighlightTokens(result, notation.markerStart)
                : result;

            return {
                highlighted: Boolean(lineBlock?.data.highlighted),
                diff: notation?.diff ?? null,
                tokens: finalTokens,
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
