import type { DocumentBlockCode } from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';
import { isV2 } from '@/lib/v2';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { ClientCodeBlock } from './ClientCodeBlock';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import { type RenderedInline, getInlines, highlight } from './highlight';

/**
 * Render a code block, can be client-side or server-side.
 */
export async function CodeBlock(props: BlockProps<DocumentBlockCode>) {
    const { block, document, style, isEstimatedOffscreen, context } = props;
    const inlines = getInlines(block);
    const richInlines: RenderedInline[] = inlines.map((inline, index) => {
        const body = (() => {
            const fragment = getNodeFragmentByType(inline.inline, 'annotation-body');
            if (!fragment) {
                return null;
            }
            return (
                <Blocks
                    key={index}
                    document={document}
                    ancestorBlocks={[]}
                    context={context}
                    nodes={fragment.nodes}
                    style="space-y-4"
                />
            );
        })();

        return { inline, body };
    });

    if (isV2() && !isEstimatedOffscreen) {
        // In v2, we render the code block server-side
        const lines = await highlight(block, richInlines);
        return <CodeBlockRenderer block={block} style={style} lines={lines} />;
    }

    return <ClientCodeBlock block={block} style={style} inlines={richInlines} />;
}
