import { DocumentBlockListUnordered } from '@gitbook/api';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListUnordered(props: BlockProps<DocumentBlockListUnordered>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="ul"
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
