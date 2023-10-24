import { tcls } from '@/lib/tailwind';
import { BlockProps } from './Block';
import { Inlines } from './Inlines';

export function Heading(props: BlockProps<any>) {
    const { block, style, ...contextProps } = props;

    const headingStyle = STYLES[block.type];

    return (
        <headingStyle.tag className={tcls(headingStyle.className, style)}>
            <Inlines {...contextProps} nodes={block.nodes} />
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
        className: ['text-base', 'font-semibold'],
    },
};
