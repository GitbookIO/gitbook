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
                'flex',
                'flex-col',
                '[&>li]:gap-[1ch]',

                '[counter-reset:list-decimal]',

                '[&>li]:flex',
                '[&>li]:flex-row',

                /* '[&>li>.bullet]:w-[1ch]', */
                '[&>li>.bullet]:tabular-nums',
                '[&>li>.bullet]:whitespace-nowrap',
                '[&>li>.bullet]:list-decimal',

                '[&>li>.bullet]:before:h-[1lh]',
                '[&>li>.bullet]:before:leading-[inherit]',
                '[&>li>.bullet]:before:flex',
                /* '[&>li>.bullet]:before:pr-[1ch]', */
                '[&>li>.bullet]:text-dark/6',

                //remove any spacing when using heading as list item
                '[&>li>div_div]:mt-0',

                'dark:[&>li>.bullet]:text-light/6',
                style,
            ]}
        />
    );
}
