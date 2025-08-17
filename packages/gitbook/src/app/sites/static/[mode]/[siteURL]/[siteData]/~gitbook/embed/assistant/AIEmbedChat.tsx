'use client';

import { useAIChatController, useAIChatState } from '@/components/AI';
import { AIChatWindow } from '@/components/AIChat';
import { createChannel } from 'bidc';
import React from 'react';

/**
 * Embeddable AI chat window in an iframe.
 */
export function AIEmbedChat(props: {
    trademark: boolean;
}) {
    const { trademark } = props;
    const chat = useAIChatState();
    const chatController = useAIChatController();

    React.useEffect(() => {
        const channel = createChannel();

        channel.receive((payload) => {
            console.log('got payload', payload);
        });

        return channel.cleanup();
    }, []);

    return (
        <div className="fixed inset-0">
            <AIChatWindow
                trademark={trademark}
                chatController={chatController}
                chat={chat}
                className=""
            />
        </div>
    );
}
