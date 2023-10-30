import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { DocumentBlockQuote } from '@gitbook/api';

export function Quote(props: BlockProps<DocumentBlockQuote>) {
    const { block, style, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="blockquote"
            nodes={block.nodes}
            style={[style, 'border-l-4', 'pl-4', 'border-slate-200', 'dark:border-slate-900']}
        />
    );
}
