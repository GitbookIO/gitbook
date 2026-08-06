import type { CustomizationThemedCodeTheme, DocumentBlockCode } from '@gitbook/api';
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

type ShikiRuntime = {
    highlight: (options: {
        code: string;
        language: string;
        themes: CustomizationThemedCodeTheme;
        runtimeURL: string;
        tokenizeMaxLineLength: number;
    }) => Promise<ShikiRuntimeResult | null>;
};

type ShikiRuntimeResult = Pick<HighlightTheme, 'bg' | 'fg' | 'themes'> & {
    tokens: PositionedToken[][];
};

const loadedRuntimes = new Map<string, Promise<ShikiRuntime>>();

/**
 * Highlight a code block while preserving inline elements.
 */
export async function highlight(
    block: DocumentBlockCode,
    inlines: RenderedInline[],
    options?: {
        evaluateInlineExpression?: (expr: string) => string;
        themes?: CustomizationThemedCodeTheme;
        shikiRuntimeURL?: string;
    }
): Promise<HighlightTheme> {
    const langName = getBlockLang(block);

    if (!langName) {
        // Fallback to plain highlighting if language is not found
        return plainHighlight(block, inlines, options);
    }

    const themes = options?.themes ?? DEFAULT_THEMES;
    const runtimeURL = options?.shikiRuntimeURL;

    if (!runtimeURL) {
        return plainHighlight(block, inlines, options);
    }

    const code = getPlainCodeBlock(block, undefined, options);

    let tokenizeMaxLineLength = 400;
    // In some cases, people will use unindented code blocks with a single line.
    // In this case, we can safely increase the max line length to avoid not highlighting the code.
    if (block.nodes.length === 1) {
        tokenizeMaxLineLength = 5000;
    }

    const highlighted = await loadShikiRuntime(runtimeURL).then((runtime) =>
        runtime.highlight({
            code,
            language: langName,
            themes,
            runtimeURL,
            tokenizeMaxLineLength,
        })
    );
    if (!highlighted) {
        return plainHighlight(block, inlines, options);
    }

    const lines = highlighted.tokens;

    let currentIndex = 0;
    return {
        bg: highlighted.bg,
        fg: highlighted.fg,
        themes: highlighted.themes,
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

const syntaxAliases: Record<string, string> = {
    // "Parser" language does not exist in Shiki, but it's used in GitBook
    // The closest language is "Blade"
    parser: 'blade',

    // From GitBook App we receive "objectivec" instead of "objective-c"
    objectivec: 'objective-c',
};

/**
 * Normalize syntax names before loading their language modules.
 */
function getLanguageForSyntax(syntax: string): string | null {
    // Normalize the syntax to lowercase.
    syntax = syntax.toLowerCase();

    if (!syntax || syntax.includes('/')) {
        return null;
    }

    return syntaxAliases[syntax] ?? syntax;
}

function loadShikiRuntime(runtimeURL: string): Promise<ShikiRuntime> {
    let runtime = loadedRuntimes.get(runtimeURL);
    if (!runtime) {
        runtime = import(/* webpackIgnore: true */ runtimeURL) as Promise<ShikiRuntime>;
        loadedRuntimes.set(runtimeURL, runtime);
    }
    return runtime;
}
