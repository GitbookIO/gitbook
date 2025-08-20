'use client';

import type { ParentToFrameMessage } from '@gitbook/embed';
import { createChannel } from 'bidc';
import React from 'react';

import { useAIChatController } from '@/components/AI';
import { useRouter } from 'next/navigation';

/**
 * Expose the API to communicate with the parent window.
 */
export function EmbedIframeAPI() {
    const chatController = useAIChatController();
    const router = useRouter();

    React.useEffect(() => {
        if (!window.top) {
            return;
        }

        const channel = createChannel();

        channel.receive((payload) => {
            const message = payload as ParentToFrameMessage;

            switch (message.type) {
                case 'clearChat': {
                    chatController.clear();
                    break;
                }
                case 'postUserMessage': {
                    chatController.postMessage({
                        message: message.message,
                    });
                    break;
                }
                case 'navigateToPage': {
                }
            }
        });

        return channel.cleanup();
    }, [chatController]);

    return null;
}
