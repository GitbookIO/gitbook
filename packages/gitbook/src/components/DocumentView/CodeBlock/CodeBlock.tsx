import type { DocumentBlockCode } from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { ClientCodeBlock } from './ClientCodeBlock';
import { type RenderedInline, getInlines } from './highlight';

/**
 * Render a code block, can be client-side or server-side.
 */
export function CodeBlock(props: BlockProps<DocumentBlockCode>) {
    const { block, document, style, context } = props;
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

    return <ClientCodeBlock block={block} style={style} inlines={richInlines} />;
}
