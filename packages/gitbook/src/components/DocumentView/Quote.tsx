import type { DocumentBlockQuote } from '@gitbook/api';

import type { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function Quote(props: BlockProps<DocumentBlockQuote>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="blockquote"
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            style={[style, 'text-tint', 'border-l-2', 'pl-6', 'py-3', 'border-tint', 'space-y-4']}
        />
    );
}
