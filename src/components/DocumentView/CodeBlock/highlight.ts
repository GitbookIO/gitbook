import shiki, { getHighlighter } from 'shiki';

export type HighlightLine = {
    tokens: HighlightToken[];
};

export type HighlightToken =
    | { type: 'shiki'; token: shiki.IThemedToken }
    | { type: 'inline'; inline: any; children: HighlightToken[] };

type InlineIndexed = { inline: any; start: number; end: number };

/**
 * Highlight a code block while preserving inline elements.
 */
export async function highlight(block: any): Promise<HighlightLine[]> {
    const inlines: InlineIndexed[] = [];
    const code = getPlainCodeBlock(block, inlines);

    console.log(inlines);

    const highlighter = await getHighlighter({
        theme: 'github-light',
        langs: ['javascript', 'python'],
    });

    const lines = highlighter.codeToThemedTokens(code, 'javascript');
    console.log(lines);

    return lines.map((tokens) => {
        const result: HighlightToken[] = [];
        let currentIndex = 0;

        for (const token of tokens) {
            // Find all inlines overlapping the current token

            result.push({
                type: 'shiki',
                token,
            });
        }

        return {
            tokens: result,
        };
    });
}

function getPlainCodeBlock(code: any, inlines: InlineIndexed[]): string {
    let content = '';

    for (const node of code.nodes) {
        const lineContent = getPlainCodeBlockLine(node, inlines, content.length);
        content += lineContent + '\n';
    }

    return content;
}

function getPlainCodeBlockLine(codeLine: any, inlines: InlineIndexed[], index: number): string {
    let content = '';

    for (const node of codeLine.nodes) {
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
