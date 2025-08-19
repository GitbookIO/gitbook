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

    return (
        <div className="fixed inset-0 flex flex-col">
            <AIChatBody trademark={trademark} chatController={chatController} chat={chat} />
        </div>
    );
}
