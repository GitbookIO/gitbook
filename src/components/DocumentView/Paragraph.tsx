import { tcls } from '@/lib/tailwind';
import { BlockProps } from './Block';
import { Inlines } from './Inlines';

export function Paragraph(props: BlockProps<any>) {
    const { block, style, ...contextProps } = props;

    return (
        <p className={tcls('text-base', 'font-normal', style)}>
            <Inlines {...contextProps} nodes={block.nodes} />
        </p>
    );
}
