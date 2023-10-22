import clsx from 'clsx';
import { BlockProps } from './Block';
import { Inlines } from './Inlines';

export function Heading(props: BlockProps<any>) {
    const { block, style } = props;

    const headingStyle = STYLES[block.type];

    return (
        <headingStyle.tag className={clsx(headingStyle.className, style)}>
            <Inlines nodes={block.nodes} />
        </headingStyle.tag>
    );
}

const STYLES = {
    'heading-1': {
        tag: 'h2',
        className: ['text-3xl', 'font-semibold'],
    },
    'heading-2': {
        tag: 'h3',
        className: ['text-2xl', 'font-semibold'],
    },
    'heading-3': {
        tag: 'h4',
        className: ['text-3xl', 'font-semibold'],
    },
};
