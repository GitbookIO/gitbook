import { DocumentBlockQuote } from '@gitbook/api';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function Quote(props: BlockProps<DocumentBlockQuote>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="blockquote"
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            style={[style, 'border-l-2', 'pl-4', 'py-3', 'border-dark/2', 'dark:border-light/2']}
        />
    );
}
