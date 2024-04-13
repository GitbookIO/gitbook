import { DocumentBlockCode, DocumentBlockCodeLine, DocumentInlineAnnotation } from '@gitbook/api';
import {
    loadWasm,
    ThemedToken,
    getHighlighter,
    createCssVariablesTheme,
    HighlighterGeneric,
    bundledLanguages,
    bundledThemes,
} from 'shiki';
// @ts-ignore - onigWasm is a Wasm module
import onigWasm from 'shiki/onig.wasm?module';

import { asyncMutexFunction, singleton } from '@/lib/async';
import { getNodeText } from '@/lib/document';
import { trace } from '@/lib/tracing';

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

const renderer = asyncMutexFunction();
let blockCount = 0;
let lineCount = 0;
let charCount = 0;

const LINE_LIMIT = 1000;

/**
 * Highlight a code block while preserving inline elements.
 */
export async function highlight(block: DocumentBlockCode): Promise<HighlightLine[]> {
    const langName = block.data.syntax ? getLanguageForSyntax(block.data.syntax) : null;
    
    if (!langName) {
        // Language not found, fallback to plain highlighting
        return plainHighlighting(block);
    }

    if (lineCount + block.nodes.length > LINE_LIMIT) {
        return plainHighlighting(block);
    }

    const inlines: InlineIndexed[] = [];
    const code = getPlainCodeBlock(block, inlines);

    inlines.sort((a, b) => {
        return a.start - b.start;
    });

    const highlighter = await loadHighlighter();
    await loadHighlighterLanguage(highlighter, langName);

    const lines = await renderer.runBlocking(async () => {
        blockCount += 1;
        lineCount += block.nodes.length;
        charCount += code.length;

        return highlighter.codeToTokensBase(code, {
            lang: langName,
            tokenizeMaxLineLength: 120,
        });
    });

    console.log(
        `${JSON.stringify({ blockCount, lineCount, charCount })} block has ${
            block.nodes.length
        } lines, ${code.length} characters ${inlines.length} inlines`,
    );
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
export function plainHighlighting(block: DocumentBlockCode): HighlightLine[] {
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
            content += cleanupLine(node.leaves.map((leaf) => leaf.text).join(''));
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
 * Currently it's possible for some lines to contain \r characters, we need to remove them
 * as they are considered as new lines by shikijs.
 */
function cleanupLine(line: string): string {
    return line.replace(/\r/g, '');
}

/**
 * Load the highlighter, only once, and reuse it.
 * It makes sure to handle concurrent calls.
 */
const loadHighlighter = singleton(async () => {
    return await trace('highlighting.loadHighlighter', async () => {
        if (typeof onigWasm !== 'string') {
            // When running bun test, the import is a string, we ignore it and let the module
            // loads it on its own.
            //
            // Otherwise for Vercel/Cloudflare, we need to load it ourselves.
            await loadWasm((obj) => WebAssembly.instantiate(onigWasm, obj));
        }
        const highlighter = await getHighlighter({
            themes: [createCssVariablesTheme()],
            langs: [],
        });
        return highlighter;
    });
});

const loadLanguagesMutex = asyncMutexFunction();
async function loadHighlighterLanguage(
    highlighter: HighlighterGeneric<keyof typeof bundledLanguages, keyof typeof bundledThemes>,
    lang: keyof typeof bundledLanguages,
) {
    await loadLanguagesMutex.runBlocking(async () => {
        if (highlighter.getLoadedLanguages().includes(lang)) {
            return;
        }

        await trace(
            `highlighting.loadLanguage(${lang})`,
            async () => await highlighter.loadLanguage(lang),
        );
    });
}
