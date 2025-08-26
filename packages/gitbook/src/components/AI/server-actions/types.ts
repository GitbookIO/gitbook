import type { AIStreamResponse } from '@gitbook/api';

/**
 * Stream when rendering an AI message.
 */
export type AIMessageRenderStream = AsyncIterable<{
    content: React.ReactNode;
    event: AIStreamResponse;
}>;

/**
 * Options that can be passed when generating a AI message stream.
 */
export type RenderAIMessageOptions = {
    /**
     * Render the tool calls.
     * @default true
     */
    withToolCalls?: boolean;

    /**
     * Render the link previews.
     * @default true
     */
    withLinkPreviews?: boolean;

    /**
     * Generate links in the context of an embeddable view.
     * @default false
     */
    asEmbeddable?: boolean;
};
