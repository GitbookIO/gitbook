import { DocumentBlockCode, DocumentBlockCodeLine, DocumentInlineAnnotation } from '@gitbook/api';
import { getHighlighter, loadWasm, bundledLanguages, Highlighter, ThemedToken } from 'shikiji';
// @ts-ignore - onigWasm is a Wasm module
import onigWasm from 'shikiji/onig.wasm?module';

import { singleton } from '@/lib/async';
import { getNodeText } from '@/lib/document';

export type HighlightLine = {
    highlighted: boolean;
    tokens: HighlightToken[];
};

export type HighlightToken =
    | { type: 'plain'; content: string }
    | { type: 'shiki'; token: ThemedToken }
    | { type: 'inline'; inline: DocumentInlineAnnotation; children: HighlightToken[] };

type InlineIndexed = { inline: any; start: number; end: number };

type PositionedToken = ThemedToken & { start: number; end: number };

/**
 * shikijs does not support the css-variables theme, so we need to map the colors
 * Map taken from https://github.com/shikijs/shiki/blob/8be7ec435ef47970e825c5f607aaf117f6a545f1/packages/shiki/src/highlighter.ts#L51C3-L63C4
 */
export const colorToCSSVar: Record<string, string> = {
    '#000001': 'var(--shiki-color-text)',
    '#000002': 'var(--shiki-color-background)',
    '#000004': 'var(--shiki-token-constant)',
    '#000005': 'var(--shiki-token-string)',
    '#000006': 'var(--shiki-token-comment)',
    '#000007': 'var(--shiki-token-keyword)',
    '#000008': 'var(--shiki-token-parameter)',
    '#000009': 'var(--shiki-token-function)',
    '#000010': 'var(--shiki-token-string-expression)',
    '#000011': 'var(--shiki-token-punctuation)',
    '#000012': 'var(--shiki-token-link)',
};

/**
 * Highlight a code block while preserving inline elements.
 */
export async function highlight(block: DocumentBlockCode): Promise<HighlightLine[]> {
    const inlines: InlineIndexed[] = [];
    const code = getPlainCodeBlock(block, inlines);
    inlines.sort((a, b) => {
        return a.start - b.start;
    });

    const langName = block.data.syntax ? getLanguageForSyntax(block.data.syntax) : null;
    if (!langName) {
        // Language not found, fallback to plain highlighting
        return plainHighlighting(block);
    }

    const instance = await loadHighlighter();
    await instance.loadLanguage(langName);

    const lines = instance.codeToThemedTokens(code, {
        theme: 'css-variables',
        lang: langName,
    });
    let currentIndex = 0;

    return lines.map((tokens, index) => {
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
            highlighted: !!lineBlock.data.highlighted,
            tokens: result,
        };
    });
}

/**
 * Validate a language name.
 */
function getLanguageForSyntax(syntax: string): keyof typeof bundledLanguages | null {
    // @ts-ignore
    const lang = bundledLanguages[syntax];
    if (!lang) {
        return null;
    }

    // @ts-ignore
    return syntax;
}

/**
 * Parse a code block without highlighting it.
 */
function plainHighlighting(block: DocumentBlockCode): HighlightLine[] {
    return block.nodes.map((lineBlock) => {
        const tokens: HighlightToken[] = [];

        for (const node of lineBlock.nodes) {
            if (node.object === 'text') {
                tokens.push({
                    type: 'plain',
                    content: getNodeText(node),
                });
            } else {
                tokens.push({
                    type: 'inline',
                    inline: node,
                    children: [
                        {
                            type: 'plain',
                            content: getNodeText(node),
                        },
                    ],
                });
            }
        }

        return {
            highlighted: !!lineBlock.data.highlighted,
            tokens,
        };
    });
}

function matchTokenAndInlines(
    eat: () => PositionedToken | null,
    allInlines: InlineIndexed[],
): HighlightToken[] {
    const initialToken = eat();
    if (!initialToken) {
        return [];
    }

    const inlines = allInlines.filter(
        (inline) => inline.start >= initialToken.start && inline.start < initialToken.end,
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

        const [before, afterBefore] = splitPositionedTokenAt(token, inline.start);
        if (before) {
            result.push({
                type: 'shiki',
                token: before,
            });
        }
        if (!afterBefore) {
            throw new Error(`expect afterBefore to not be empty`);
        }

        token = afterBefore;
        const children: HighlightToken[] = [];

        // If shiki token finished before the end of the annotation or the annotation contains multiple tokens
        while (token.end < inline.end) {
            // console.log('push inner', { token, inlineStart: inline.start, inlineEnd: inline.end })
            children.push({
                type: 'shiki',
                token: token,
            });

            const next = eat();
            if (!next) {
                throw new Error(`expect token to not be empty`);
            }
            token = next;
        }

        const [inside, after] = splitPositionedTokenAt(token, inline.end);
        if (!inside) {
            throw new Error(`expect inside to not be empty`);
        }

        children.push({
            type: 'shiki',
            token: inside,
        });

        result.push({
            type: 'inline',
            inline: inline.inline,
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

function getPlainCodeBlock(code: DocumentBlockCode, inlines: InlineIndexed[]): string {
    let content = '';

    code.nodes.forEach((node, index) => {
        const lineContent = getPlainCodeBlockLine(node, inlines, content.length);
        content += lineContent;

        if (index < code.nodes.length - 1) {
            content += '\n';
        }
    });

    return content;
}

function getPlainCodeBlockLine(
    parent: DocumentBlockCodeLine | DocumentInlineAnnotation,
    inlines: InlineIndexed[],
    index: number,
): string {
    let content = '';

    for (const node of parent.nodes) {
        if (node.object === 'text') {
            content += node.leaves.map((leaf) => leaf.text).join('');
        } else {
            const start = index + content.length;
            content += getPlainCodeBlockLine(node, inlines, index + content.length);
            const end = index + content.length;

            inlines.push({
                inline: node,
                start,
                end,
            });
        }
    }

    return content;
}

function slicePositionedToken(
    token: PositionedToken,
    relativeStart: number,
    relativeLength: number,
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
    absoluteIndex: number,
): [PositionedToken | null, PositionedToken | null] {
    if (absoluteIndex < token.start || absoluteIndex > token.end) {
        throw new Error(`index (${absoluteIndex}) out of bound (${token.start}:${token.end})`);
    }

    const before = slicePositionedToken(token, 0, absoluteIndex - token.start);
    const after = slicePositionedToken(
        token,
        absoluteIndex - token.start,
        token.end - absoluteIndex,
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
 * Load the highlighter, only once, and reuse it.
 * It makes sure to handle concurrent calls.
 */
const loadHighlighter = singleton(async () => {
    if (typeof onigWasm !== 'string') {
        // When running bun test, the import is a string, we ignore it and let the module
        // loads it on its own.
        //
        // Otherwise for Vercel/Cloudflare, we need to load it ourselves.
        await loadWasm((obj) => WebAssembly.instantiate(onigWasm, obj));
    }
    const instance = await getHighlighter();
    await instance.loadTheme('css-variables');
    return instance;
});
