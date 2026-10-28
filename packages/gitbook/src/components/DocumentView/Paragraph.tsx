import type { DocumentBlockParagraph } from '@gitbook/api';
import { CustomizationAIMode } from '@gitbook/api';

import type { BlockProps } from './Block';
import { Inlines } from './Inlines';
import { getTextAlignment } from './utils';
import { getCommentAnchorProps } from './utils';
import { getNodeText } from '@/lib/document';
import { tcls } from '@/lib/tailwind';

export function Paragraph(props: BlockProps<DocumentBlockParagraph>) {
    const { block, style, ancestorBlocks, ...contextProps } = props;
    const { context } = contextProps;
    // Like the app, a list item owns the comments on its direct paragraph.
    const isCommentTarget = ancestorBlocks.at(-1)?.type !== 'list-item';

    const paragraph = (
        <p
            {...(isCommentTarget ? getCommentAnchorProps(context, block.key) : {})}
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
        // Table cells would clip the margin button, and big tables hold thousands of paragraphs.
        !ancestorBlocks.some((ancestor) => ancestor.type === 'table') &&
        contentContext != null &&
        'customization' in contentContext &&
        contentContext.customization.ai.mode === CustomizationAIMode.Assistant;

    const text = aiAssistantEnabled ? getNodeText(block) : '';
    if (aiAssistantEnabled && text.trim()) {
        // The wrapper is now the flex child, so it must carry the block alignment (notably
        // `self-center`/`self-end`) — otherwise centered paragraphs pin left on wide/no-TOC pages.
        return (
            <div
                // The shared `AskAIParagraphButton` portals itself into the hovered wrapper.
                data-ask-ai-paragraph=""
                className={tcls(
                    'group/ask-ai relative',
                    style,
                    getTextAlignment(block.data?.align)
                )}
            >
                {paragraph}
            </div>
        );
    }

    return paragraph;
}
