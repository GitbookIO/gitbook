import type { DocumentBlockCode, DocumentBlockCodeLine } from '@gitbook/api';

const PREFILL_WITH_EXPR_REGEX = /\$\$__X-GITBOOK-PREFILL\[(.+?)\]__\$\$/g;

/**
 * Convert a raw code string into a `DocumentBlockCode` object representation.
 *
 * Any placeholder of the form `$$__X-GITBOOK-PREFILL[<expression>]__$$` inside the code
 * string is transformed into a DocumentInlineExpression node with its `data.expression` set to the
 * extracted `<expression>`.
 */
export function convertCodeStringToBlock(args: {
    key: string;
    code: string;
    syntax: string;
}): DocumentBlockCode {
    const { key, code, syntax } = args;
    const lines = code.split('\n').map<DocumentBlockCodeLine>((line) => {
        const nodes: DocumentBlockCodeLine['nodes'] = [];
        let lastIndex = 0;

        for (const match of line.matchAll(PREFILL_WITH_EXPR_REGEX)) {
            const [placeholder, expression] = match;
            const start = match.index ?? 0;

            if (start > lastIndex) {
                nodes.push({
                    object: 'text',
                    leaves: [{ object: 'leaf', text: line.slice(lastIndex, start), marks: [] }],
                });
            }

            if (expression) {
                nodes.push({
                    object: 'inline',
                    type: 'expression',
                    data: { expression },
                    isVoid: true,
                });
            }

            lastIndex = start + placeholder.length;
        }

        if (lastIndex < line.length) {
            nodes.push({
                object: 'text',
                leaves: [{ object: 'leaf', text: line.slice(lastIndex), marks: [] }],
            });
        }

        return {
            object: 'block',
            type: 'code-line',
            data: {},
            nodes,
        };
    });

    return {
        key,
        object: 'block',
        type: 'code',
        data: { syntax },
        nodes: lines,
    };
}
