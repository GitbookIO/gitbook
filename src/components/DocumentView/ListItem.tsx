import { tcls } from '@/lib/tailwind';
import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListItem(props: BlockProps<any>) {
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
