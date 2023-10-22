import clsx from 'clsx';
import { BlockProps } from './Block';
import { Blocks } from './Blocks';

export function ListItem(props: BlockProps<any>) {
    const { block } = props;

    return (
        <li className={clsx('text-base', 'font-normal')}>
            <Blocks nodes={block.nodes} blockStyle={clsx('mt-6', 'first:mt-0', 'last:mt-0')} />
        </li>
    );
}
