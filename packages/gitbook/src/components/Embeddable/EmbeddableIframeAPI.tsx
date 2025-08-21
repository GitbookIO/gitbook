'use client';

import type { ParentToFrameMessage } from '@gitbook/embed';
import { createChannel } from 'bidc';
import React from 'react';

import { useAIChatController } from '@/components/AI';

/**
 * Expose the API to communicate with the parent window.
 */
export function EmbeddableIframeAPI() {
    const chatController = useAIChatController();

    React.useEffect(() => {
        if (window.parent === window) {
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
                // TODO: Handle other messages
            }
        });

        return channel.cleanup();
    }, [chatController]);

    return null;
}
