import type { DocumentBlockParagraph } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { Inlines } from './Inlines';
import { getTextAlignment } from './utils';

export function Paragraph(props: BlockProps<DocumentBlockParagraph>) {
    const { block, style, ...contextProps } = props;

    return (
        <p className={tcls(style, getTextAlignment(block.data?.align))}>
            <Inlines {...contextProps} nodes={block.nodes} ancestorInlines={[]} />
        </p>
    );
}
