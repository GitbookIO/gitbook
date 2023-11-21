import { DocumentBlockParagraph } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import { BlockProps } from './Block';
import { Inlines } from './Inlines';

export function Paragraph(props: BlockProps<DocumentBlockParagraph>) {
    const { block, style, ...contextProps } = props;

    return (
        <p className={tcls('font-normal', style)}>
            <Inlines {...contextProps} nodes={block.nodes} />
        </p>
    );
}
