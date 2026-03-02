import type { DocumentBlockUpdates } from '@gitbook/api';
import type { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function Updates(props: BlockProps<DocumentBlockUpdates>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            style={[style, 'updates-block flex flex-col gap-20']}
        />
    );
}
