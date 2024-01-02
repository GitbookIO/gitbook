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
                'list-decimal',
                'ps-[2ch]',
                'marker:[font-variant-numeric:normal]',
                'marker:text-dark/6',
                '[&>li]:pl-[.25ch]',
                'dark:marker:text-light/6',
                style,
            ]}
        />
    );
}
