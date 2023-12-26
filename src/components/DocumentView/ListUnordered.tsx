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
            /*             style={['list-disc', 'ps-[1ch]', 'space-y-2', style]} */
            style={[
                'space-y-2',
                'ps-[1ch]',
                'list-none',
                'marker:content-["–"]',
                'marker:text-dark/6',
                '[&>li]:pl-[1.25ch]',
                'dark:marker:text-light/5',
                style,
            ]}
        />
    );
}
