import type { DocumentBlockCode } from '@gitbook/api';

import { getNodeFragmentByType } from '@/lib/document';
import { isV2 } from '@/lib/v2';

import type { BlockProps } from '../Block';
import { Blocks } from '../Blocks';
import { ClientCodeBlock } from './ClientCodeBlock';
import { CodeBlockRenderer } from './CodeBlockRenderer';
import { type RenderedInline, getInlines, highlight } from './highlight';
import { getLightNodes } from './tree';

/**
 * Render a code block, can be client-side or server-side.
 */
export async function CodeBlock(props: BlockProps<DocumentBlockCode>) {
    const { block, document, style, isEstimatedOffscreen, context } = props;
    const withLineNumbers = Boolean(block.data.lineNumbers) && block.nodes.length > 1;
    const withWrap = block.data.overflow === 'wrap';
    const title = block.data.title ?? '';
    const lightNodes = getLightNodes(block);
    const inlines = getInlines(lightNodes);
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
        const lines = await highlight({
            inlines: richInlines,
            syntax: block.data.syntax,
            lightNodes,
        });
        return (
            <CodeBlockRenderer
                withLineNumbers={withLineNumbers}
                withWrap={withWrap}
                title={title}
                style={style}
                lines={lines}
            />
        );
    }

    return (
        <ClientCodeBlock
            lightNodes={lightNodes}
            withLineNumbers={withLineNumbers}
            withWrap={withWrap}
            title={title}
            style={style}
            inlines={richInlines}
            syntax={block.data.syntax}
        />
    );
}
