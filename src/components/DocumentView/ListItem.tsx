import { DocumentBlockListItem } from '@gitbook/api';

import { Checkbox } from '@/components/utils';
import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListItem(props: BlockProps<DocumentBlockListItem>) {
    const { block, ancestorBlocks, ...contextProps } = props;

    const isTaskList = ancestorBlocks[ancestorBlocks.length - 1]?.type === 'list-tasks';

    return (
        <li>
            {isTaskList ? (
                <div className={tcls('flex', 'flex-row', 'items-baseline')}>
                    <Checkbox
                        id={block.key!}
                        disabled
                        checked={block.data?.checked}
                        className={tcls('top-0.5', 'relative')}
                    />

                    <label htmlFor={block.key}>
                        <Blocks
                            {...contextProps}
                            nodes={block.nodes}
                            ancestorBlocks={[...ancestorBlocks, block]}
                            blockStyle={tcls('flex-1')}
                            style={tcls('ml-2', 'space-y-2')}
                        />
                    </label>
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
