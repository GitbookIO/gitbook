import type { DocumentBlockParagraph } from '@gitbook/api';
import { CustomizationAIMode } from '@gitbook/api';

import type { BlockProps } from './Block';
import { Inlines } from './Inlines';
import { getTextAlignment } from './utils';
import { AskAIParagraphButton } from '@/components/AIChat/AskAIParagraphButton';
import { getNodeText } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

export function Paragraph(props: BlockProps<DocumentBlockParagraph>) {
    const { block, style, ...contextProps } = props;
    const { context } = contextProps;

    const paragraph = (
        <p
            // Cover-aware contrast text applies only to the page body, not to documents
            // rendered in overlays (search answers, AI chat) on a background-cover page.
            data-cover-aware-text={context.isPageBody ? '' : undefined}
            // Paragraph styles live in globals.css (`.paragraph`) to keep the class attribute short.
            className={tcls('paragraph', style, getTextAlignment(block.data?.align))}
        >
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
        // The wrapper is now the flex child, so it must carry the block alignment (notably
        // `self-center`/`self-end`) — otherwise centered paragraphs pin left on wide/no-TOC pages.
        return (
            <div
                className={tcls(
                    'group/ask-ai relative',
                    style,
                    getTextAlignment(block.data?.align)
                )}
            >
                {paragraph}
                <AskAIParagraphButton content={text} />
            </div>
        );
    }

    return paragraph;
}
