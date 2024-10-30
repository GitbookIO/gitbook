import {
    DocumentBlockListOrdered,
    DocumentBlockListTasks,
    DocumentBlockListUnordered,
} from '@gitbook/api';
import assertNever from 'assert-never';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function List(
    props: BlockProps<
        DocumentBlockListUnordered | DocumentBlockListOrdered | DocumentBlockListTasks
    >,
) {
    const { block, style, ancestorBlocks, ...contextProps } = props;

    return (
        <Blocks
            {...contextProps}
            tag={getListTag(block.type)}
            nodes={block.nodes}
            ancestorBlocks={[...ancestorBlocks, block]}
            style={['space-y-2', style]}
        />
    );
}

function getListTag(
    type:
        | DocumentBlockListUnordered['type']
        | DocumentBlockListOrdered['type']
        | DocumentBlockListTasks['type'],
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
