import {
    type HighlighterCore,
    type LanguageRegistration,
    type ThemeRegistrationAny,
    createHighlighterCore,
} from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

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
import {
    SHIKI_LANGUAGES,
    SHIKI_LANGUAGE_GRAMMARS,
    SHIKI_THEMES,
    getShikiGrammarAssetPath,
    getShikiThemeAssetPath,
} from './shiki-catalog';

/**
 * Read a Shiki asset (grammar or theme JSON) from its path relative to `~gitbook/static`.
 */
export type ShikiAssetLoader = (path: string) => Promise<unknown>;

// Syntaxes sent by GitBook that are not Shiki ids or aliases.
const syntaxAliases: Record<string, string> = {
    // "Parser" language does not exist in Shiki, but it's used in GitBook
    // The closest language is "Blade"
    parser: 'blade',

    // From GitBook App we receive "objectivec" instead of "objective-c"
    objectivec: 'objective-c',
};

/**
 * Resolve a code block syntax to a canonical Shiki language id.
 */
export function getLanguageForSyntax(syntax: string): string | null {
    const normalized = syntax.toLowerCase();
    return SHIKI_LANGUAGES[normalized] ?? SHIKI_LANGUAGES[syntaxAliases[normalized] ?? ''] ?? null;
}

function getBlockLang(block: DocumentBlockCode): string | null {
    return block.data.syntax ? getLanguageForSyntax(block.data.syntax) : null;
}

/**
 * Create the highlighting functions, loading grammars and themes on demand through `loadAsset`.
 */
export function createHighlight(loadAsset: ShikiAssetLoader) {
    let highlighterPromise: Promise<HighlighterCore> | null = null;
    const pending = new Map<string, Promise<unknown>>();

    // Share in-flight and finished loads; forget failures so a later render retries.
    function once<T>(key: string, load: () => Promise<T>): Promise<T> {
        let promise = pending.get(key) as Promise<T> | undefined;
        if (!promise) {
            promise = load();
            pending.set(key, promise);
            promise.catch(() => pending.delete(key));
        }
        return promise;
    }

    function getHighlighter() {
        highlighterPromise ??= createHighlighterCore({
            engine: createJavaScriptRegexEngine({ forgiving: true, target: 'ES2018' }),
        });
        return highlighterPromise;
    }

    function loadLanguage(highlighter: HighlighterCore, lang: string) {
        return once(`lang:${lang}`, async () => {
            const names = SHIKI_LANGUAGE_GRAMMARS[lang];
            if (!names) {
                throw new Error(`Unknown language "${lang}"`);
            }
            const grammars = await Promise.all(
                names.map(
                    (name) =>
                        once(`grammar:${name}`, () =>
                            loadAsset(getShikiGrammarAssetPath(name))
                        ) as Promise<LanguageRegistration>
                )
            );
            const loaded = new Set(highlighter.getLoadedLanguages());
            await highlighter.loadLanguage(
                ...grammars.filter((grammar) => !loaded.has(grammar.name))
            );
        });
    }

    function loadTheme(highlighter: HighlighterCore, theme: string) {
        return once(`theme:${theme}`, async () => {
            const custom = customThemes[theme];
            if (custom) {
                await highlighter.loadTheme(custom);
                return;
            }
            if (!SHIKI_THEMES[theme]) {
                throw new Error(`Unknown theme "${theme}"`);
            }
            await highlighter.loadTheme(
                (await loadAsset(getShikiThemeAssetPath(theme))) as ThemeRegistrationAny
            );
        });
    }

    async function loadHighlighter(lang: string, themes: CustomizationThemedCodeTheme) {
        const highlighter = await getHighlighter();
        await Promise.all([
            loadLanguage(highlighter, lang),
            loadTheme(highlighter, themes.light),
            loadTheme(highlighter, themes.dark),
        ]);
        return highlighter;
    }

    /**
     * Preload the highlighter for a code block.
     */
    async function preloadHighlight(
        block: DocumentBlockCode,
        themes: CustomizationThemedCodeTheme = DEFAULT_THEMES
    ) {
        const langName = getBlockLang(block);
        if (langName) {
            await loadHighlighter(langName, themes).catch(() => {
                // Rendering retries and reports the failure.
            });
        }
    }

    /**
     * Highlight a code block while preserving inline elements.
     */
    async function highlight(
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

        let highlighter: HighlighterCore;
        try {
            highlighter = await loadHighlighter(langName, themes);
        } catch (error) {
            console.error(
                `Failed to load the "${langName}" highlighter, falling back to plain`,
                error
            );
            return plainHighlight(block, inlines, options);
        }

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
                        ? {
                              ...token,
                              start: currentIndex - token.content.length,
                              end: currentIndex,
                          }
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

    return { highlight, preloadHighlight };
}
