import type { DocumentBlockParagraph } from '@gitbook/api';

import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { Inlines } from './Inlines';
import { getTextAlignment } from './utils';

export function Paragraph(props: BlockProps<DocumentBlockParagraph>) {
    const { block, style, ...contextProps } = props;

    // InlineActionButtons use flex-grow to take the available width. This requires the parent to be a flex container.
    const inlineButtonStyle =
        'has-[.button,input]:flex has-[.button,input]:flex-wrap has-[.button,input]:gap-2';

    return (
        <p className={tcls(inlineButtonStyle, style, getTextAlignment(block.data?.align))}>
            <Inlines {...contextProps} nodes={block.nodes} ancestorInlines={[]} />
        </p>
    );
}
