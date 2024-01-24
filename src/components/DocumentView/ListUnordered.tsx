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
                'list-none',
                'space-y-2',
                '[&>li]:relative',
                '[&>li]:ps-[2.25ch]',
                '[&>li]:before:text-dark/6',
                '[&>li]:before:content-["–"]',
                '[&>li]:before:absolute',
                '[&>li]:before:left-0',
                'dark:[&>li]:before:text-light/6',
                style,
            ]}
        />
    );
}
