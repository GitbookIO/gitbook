import { DocumentBlockCode, JSONDocument } from '@gitbook/api';
import { useId } from 'react';

import { CodeBlock } from './CodeBlock';

/**
 * Plain code block with syntax highlighting.
 * For simplicity, this is just a wrapper around the CodeBlock component, emulating a document.
 */
export function PlainCodeBlock(props: { code: string; syntax: string }) {
    const { code, syntax } = props;
    const id = useId();

    const block: DocumentBlockCode = {
        key: id,
        object: 'block',
        type: 'code',
        data: {
            syntax,
        },
        nodes: code.split('\n').map((line) => ({
            object: 'block',
            type: 'code-line',
            data: {},
            nodes: [
                {
                    object: 'text',
                    leaves: [
                        {
                            object: 'leaf',
                            text: line,
                            marks: [],
                        },
                    ],
                },
            ],
        })),
    };

    const document: JSONDocument = {
        object: 'document',
        data: {},
        nodes: [block],
    };

    return (
        <CodeBlock
            document={document}
            context={{
                mode: 'default',
                contentRefContext: null,
                resolveContentRef: async () => null,
                shouldHighlightCode: () => true,
            }}
            block={block}
            ancestorBlocks={[]}
            isEstimatedOffscreen={false}
        />
    );
}
