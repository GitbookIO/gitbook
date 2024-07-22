import { DocumentBlockListTasks, DocumentBlockListUnordered } from '@gitbook/api';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListTasks(props: BlockProps<DocumentBlockListTasks>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag="ul"
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            style={[
                'list-none',
                '[&>li]:pl-[.25ch]',
                //remove any spacing when using heading as list item
                '[&>li>div_div]:mt-0',
                'space-y-2',
                style,
            ]}
        />
    );
}
