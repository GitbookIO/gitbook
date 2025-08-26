'use client';

import type { GitBookEmbeddableConfiguration, ParentToFrameMessage } from '@gitbook/embed';
import { createChannel } from 'bidc';
import React from 'react';

import { useAIChatController } from '@/components/AI';
import { useRouter } from 'next/navigation';
import { createStore, useStore } from 'zustand';
import { integrationsAssistantTools } from '../Integrations';
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
export function EmbeddableIframeAPI(props: {
    baseURL: string;
}) {
    const { baseURL } = props;

    const router = useRouter();
    const chatController = useAIChatController();

    React.useEffect(() => {
        if (window.parent === window) {
            return;
        }

        console.log('[gitbook] create channel with parent window');
        const channel = createChannel();

        channel.receive((payload) => {
            const message = payload as ParentToFrameMessage;

            console.log('[gitbook] received message', message);

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
                    integrationsAssistantTools.setState({
                        tools: message.settings.tools,
                    });
                    break;
                }
                case 'navigateToPage': {
                    router.push(`${baseURL}/page/${message.pagePath}`);
                    break;
                }
                case 'navigateToAssistant': {
                    router.push(`${baseURL}/assistant`);
                    break;
                }
            }
        });

        return () => {
            console.log('[gitbook] cleanup');
            channel.cleanup();
        };
    }, [chatController, router, baseURL]);

    return null;
}

/**
 * Hook to get the configuration from the parent window.
 */
export function useEmbeddableConfiguration<T = GitBookEmbeddableConfiguration>(
    // @ts-expect-error - This is a workaround to allow the function to be optional.
    fn: (state: GitBookEmbeddableConfiguration) => T = (state) => state
) {
    return useStore(embeddableConfiguration, fn);
}

/**
 * Display the buttons defined by the parent window.
 */
export function EmbeddableIframeButtons() {
    const buttons = useEmbeddableConfiguration((state) => state.buttons);

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
