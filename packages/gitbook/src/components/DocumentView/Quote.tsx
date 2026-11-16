import type { DocumentBlockQuote } from '@gitbook/api';

import type { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { tcls } from '@/lib/tailwind';

export function Quote(props: BlockProps<DocumentBlockQuote>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="blockquote"
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            // Merged here: `text-tint` must beat a hint's `text-neutral-strong` passed in `style`.
            style={tcls(style, 'text-tint border-l-2 pl-6 py-3 border-tint space-y-4')}
        />
    );
}
