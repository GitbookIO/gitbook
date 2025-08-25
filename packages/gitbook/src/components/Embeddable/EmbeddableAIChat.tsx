'use client';

import { useAIChatController, useAIChatState } from '@/components/AI';
import { AIChatBody, AIChatControlButton, AIChatDynamicIcon } from '@/components/AIChat';
import {
    EmbeddableFrame,
    EmbeddableFrameBody,
    EmbeddableFrameButtons,
    EmbeddableFrameHeader,
    EmbeddableFrameHeaderMain,
    EmbeddableFrameTitle,
} from './EmbeddableFrame';
import { EmbeddableIframeButtons } from './EmbeddableIframeAPI';

/**
 * Embeddable AI chat window in an iframe.
 */
export function EmbeddableAIChat(props: {
    trademark: boolean;
}) {
    const { trademark } = props;
    const chat = useAIChatState();
    const chatController = useAIChatController();

    return (
        <EmbeddableFrame>
            <EmbeddableFrameHeader>
                <AIChatDynamicIcon trademark={trademark} />
                <EmbeddableFrameHeaderMain>
                    <EmbeddableFrameTitle>Chat with us</EmbeddableFrameTitle>
                </EmbeddableFrameHeaderMain>
                <EmbeddableFrameButtons>
                    <AIChatControlButton />
                    <EmbeddableIframeButtons />
                </EmbeddableFrameButtons>
            </EmbeddableFrameHeader>
            <EmbeddableFrameBody>
                <AIChatBody trademark={trademark} chatController={chatController} chat={chat} />
            </EmbeddableFrameBody>
        </EmbeddableFrame>
    );
}
