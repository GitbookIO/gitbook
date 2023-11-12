import { DocumentBlockListItem, DocumentBlockTaskListItem } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListItem(props: BlockProps<DocumentBlockListItem | DocumentBlockTaskListItem>) {
    const { block, ancestorBlocks, ...contextProps } = props;

    const isTaskList = ancestorBlocks[ancestorBlocks.length - 1]?.type === 'list-tasks';

    return (
        <li className={tcls('text-base', 'font-normal')}>
            {isTaskList ? (
                <div className={tcls('flex', 'flex-row')}>
                    <input type="checkbox" disabled checked={block.data?.checked} />
                    <Blocks
                        {...contextProps}
                        nodes={block.nodes}
                        ancestorBlocks={[...ancestorBlocks, block]}
                        blockStyle={tcls('mt-6', 'first:mt-0', 'last:mt-0', 'flex-1')}
                    />
                </div>
            ) : (
                <Blocks
                    {...contextProps}
                    nodes={block.nodes}
                    ancestorBlocks={[...ancestorBlocks, block]}
                    blockStyle={tcls('mt-6', 'first:mt-0', 'last:mt-0')}
                />
            )}
        </li>
    );
}
