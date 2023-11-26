import { DocumentBlockCode, DocumentBlockCodeLine, DocumentInlineAnnotation } from '@gitbook/api';
import shiki, { getHighlighter } from 'shiki';
import theme from 'shiki/themes/css-variables.json';

import { getLanguageByName } from './languages';

export type HighlightLine = {
    highlighted: boolean;
    tokens: HighlightToken[];
};

export type HighlightToken =
    | { type: 'shiki'; token: shiki.IThemedToken }
    | { type: 'inline'; inline: DocumentInlineAnnotation; children: HighlightToken[] };

type InlineIndexed = { inline: any; start: number; end: number };

type PositionedToken = shiki.IThemedToken & { start: number; end: number };

/**
 * Highlight a code block while preserving inline elements.
 */
export async function highlight(block: DocumentBlockCode): Promise<HighlightLine[]> {
    const inlines: InlineIndexed[] = [];
    const code = getPlainCodeBlock(block, inlines);
    inlines.sort((a, b) => {
        return a.start - b.start;
    });

    const langs = await getLanguageByName('javascript');
    const highlighter = await getHighlighter({
        theme,
        langs,
    });

    const lines = highlighter.codeToThemedTokens(code, langs[0].id);
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

        const [inside, after] = splitPositionedTokenAt(afterBefore, inline.end);
        if (!inside) {
            throw new Error(`expect inside to not be empty`);
        }

        result.push({
            type: 'inline',
            inline: inline.inline,
            children: [
                {
                    type: 'shiki',
                    token: inside,
                },
            ],
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
        throw new Error('index out of bound');
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
