import type {
    DocumentBlockListOrdered,
    DocumentBlockListTasks,
    DocumentBlockListUnordered,
} from '@gitbook/api';
import assertNever from 'assert-never';

import type { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function List(
    props: BlockProps<
        DocumentBlockListUnordered | DocumentBlockListOrdered | DocumentBlockListTasks
    >
) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag={getListTag(block.type)}
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            // `-mt-4` because we apply a `mt-5` to all blocks but we only want a margin top of 6px for lists
            style={[style, 'min-w-0 space-y-2 -mt-4']}
        />
    );
}

function getListTag(
    type:
        | DocumentBlockListUnordered['type']
        | DocumentBlockListOrdered['type']
        | DocumentBlockListTasks['type']
) {
    switch (type) {
        case 'list-ordered':
            return 'ol';
        case 'list-unordered':
        case 'list-tasks':
            return 'ul';
        default:
            assertNever(type);
    }
}
