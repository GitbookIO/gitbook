import type { DocumentBlockCode } from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';

import { BlockProps } from '../Block';
import { ClientCodeBlock } from './ClientCodeBlock';
import { getInlines, RenderedInline } from './highlight';
import { Blocks } from '../Blocks';
import { ServerCodeBlock } from './ServerCodeBlock';

/**
 * Render a code block, can be client-side or server-side.
 */
export function CodeBlock(props: BlockProps<DocumentBlockCode>) {
    const { block, document, style, context, isEstimatedOffscreen } = props;
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
                    style={['space-y-4']}
                />
            );
        })();

        return { inline, body };
    });

    if (isEstimatedOffscreen) {
        return <ClientCodeBlock block={block} style={style} inlines={richInlines} />;
    }

    return <ServerCodeBlock block={block} style={style} inlines={richInlines} />;
}
