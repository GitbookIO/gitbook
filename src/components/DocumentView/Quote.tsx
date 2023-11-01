import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { DocumentBlockQuote } from '@gitbook/api';

export function Quote(props: BlockProps<DocumentBlockQuote>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="blockquote"
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            style={[style, 'border-l-4', 'pl-4', 'border-slate-200', 'dark:border-slate-900']}
        />
    );
}
