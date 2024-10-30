import { DocumentBlockListOrdered } from '@gitbook/api';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListOrdered(props: BlockProps<DocumentBlockListOrdered>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="ol"
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            style={[
                'space-y-2',
                // remove any spacing when using heading as list item
                '[&>li>div_div]:mt-0',
                style,
            ]}
        />
    );
}
