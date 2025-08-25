'use client';

import type { GitBookEmbeddableConfiguration, ParentToFrameMessage } from '@gitbook/embed';
import { createChannel } from 'bidc';
import React from 'react';

import { useAIChatController } from '@/components/AI';
import { createStore, useStore } from 'zustand';
import { Button } from '../primitives';

const embeddableConfiguration = createStore<GitBookEmbeddableConfiguration>(() => ({
    buttons: [],
    welcomeMessage: '',
    suggestions: [],
    tools: [],
}));

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
                case 'configure': {
                    embeddableConfiguration.setState(message.settings);
                    break;
                }
                case 'navigateToPage': {
                    throw new Error('Not implemented');
                    break;
                }
                case 'navigateToAssistant': {
                    throw new Error('Not implemented');
                    break;
                }
            }
        });

        return channel.cleanup();
    }, [chatController]);

    return null;
}

/**
 * Display the buttons defined by the parent window.
 */
export function EmbeddableIframeButtons() {
    const buttons = useStore(embeddableConfiguration, (state) => state.buttons);

    return (
        <>
            {buttons.map((button) => (
                <Button
                    key={button.label}
                    size="default"
                    variant="blank"
                    icon={button.icon}
                    label={button.label}
                    iconOnly
                    onClick={() => {
                        button.onClick();
                    }}
                />
            ))}
        </>
    );
}
