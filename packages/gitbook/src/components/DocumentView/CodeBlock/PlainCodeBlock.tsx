import type { JSONDocument } from '@gitbook/api';
import { useId } from 'react';

import { CodeBlock } from './CodeBlock';
import { convertCodeStringToBlock } from './utils';

/**
 * Plain code block with syntax highlighting.
 * For simplicity, this is just a wrapper around the CodeBlock component, emulating a document.
 */
export function PlainCodeBlock(props: { code: string; syntax: string }) {
    const { code, syntax } = props;
    const id = useId();

    const block = convertCodeStringToBlock({ key: id, code, syntax });

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
            }}
            block={block}
            ancestorBlocks={[]}
            // We optimize perf by default
            isEstimatedOffscreen
        />
    );
}
