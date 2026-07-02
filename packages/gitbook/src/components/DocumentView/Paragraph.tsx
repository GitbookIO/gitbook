import type { DocumentBlockParagraph } from '@gitbook/api';
import { CustomizationAIMode } from '@gitbook/api';

import { AskAIParagraphButton } from '@/components/AIChat/AskAIParagraphButton';
import { getNodeText } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

import type { BlockProps } from './Block';
import { Inlines } from './Inlines';
import { getTextAlignment } from './utils';

export function Paragraph(props: BlockProps<DocumentBlockParagraph>) {
    const { block, style, ...contextProps } = props;
    const { context } = contextProps;

    // InlineActionButtons use flex-grow to take the available width. This requires the parent to be a flex container.
    const inlineButtonStyle =
        'has-[.button,input]:flex has-[.button,input]:flex-wrap has-[.button,input]:gap-2 has-[.button,input]:items-center';

    const paragraph = (
        <p className={tcls(inlineButtonStyle, style, getTextAlignment(block.data?.align))}>
            <Inlines {...contextProps} nodes={block.nodes} ancestorInlines={[]} />
        </p>
    );

    // Offer to ask the assistant about any paragraph, in Assistant mode, on screen.
    const contentContext = context.contentContext;
    const aiAssistantEnabled =
        context.mode !== 'print' &&
        contentContext != null &&
        'customization' in contentContext &&
        contentContext.customization.ai.mode === CustomizationAIMode.Assistant;

    const text = aiAssistantEnabled ? getNodeText(block) : '';
    if (aiAssistantEnabled && text.trim()) {
        return (
            <div className={tcls('group/ask-ai relative', style)}>
                {paragraph}
                <AskAIParagraphButton content={text} />
            </div>
        );
    }

    return paragraph;
}
