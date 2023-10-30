import { tcls } from '@/lib/tailwind';
import { BlockProps } from './Block';
import { Blocks } from './Blocks';
import { DocumentBlockListItem } from '@gitbook/api';

export function ListItem(props: BlockProps<DocumentBlockListItem>) {
    const { block, ...contextProps } = props;

    return (
        <li className={tcls('text-base', 'font-normal')}>
            <Blocks
                {...contextProps}
                nodes={block.nodes}
                blockStyle={tcls('mt-6', 'first:mt-0', 'last:mt-0')}
            />
        </li>
    );
}
