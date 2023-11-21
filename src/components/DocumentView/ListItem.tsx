import { DocumentBlockListItem } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListItem(props: BlockProps<DocumentBlockListItem>) {
    const { block, ancestorBlocks, ...contextProps } = props;

    const isTaskList = ancestorBlocks[ancestorBlocks.length - 1]?.type === 'list-tasks';

    return (
        <li className={tcls('text-base', 'font-normal')}>
            {isTaskList ? (
                <div className={tcls('flex', 'flex-row', 'items-baseline')}>
                    <input type="checkbox" disabled checked={block.data?.checked} />
                    <Blocks
                        {...contextProps}
                        nodes={block.nodes}
                        ancestorBlocks={[...ancestorBlocks, block]}
                        blockStyle={tcls('flex-1')}
                        style={tcls('ml-2', 'space-y-2')}
                    />
                </div>
            ) : (
                <Blocks
                    {...contextProps}
                    nodes={block.nodes}
                    ancestorBlocks={[...ancestorBlocks, block]}
                    style={tcls('space-y-2')}
                />
            )}
        </li>
    );
}
