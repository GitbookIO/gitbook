import clsx from 'clsx';
import { BlockProps } from './Block';
import { Inlines } from './Inlines';

export function Paragraph(props: BlockProps<any>) {
    const { block, style } = props;

    return (
        <p className={clsx('text-base', 'font-normal', style)}>
            <Inlines nodes={block.nodes} />
        </p>
    );
}
