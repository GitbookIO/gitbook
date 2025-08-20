'use client';

import { useAIChatController, useAIChatState } from '@/components/AI';
import { AIChatBody } from '@/components/AIChat';

/**
 * Embeddable AI chat window in an iframe.
 */
export function AIEmbedChat(props: {
    trademark: boolean;
}) {
    const { trademark } = props;
    const chat = useAIChatState();
    const chatController = useAIChatController();

    return <AIChatBody trademark={trademark} chatController={chatController} chat={chat} />;
}
