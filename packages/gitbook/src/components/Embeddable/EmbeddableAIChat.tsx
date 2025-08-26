'use client';

import { useAIChatController, useAIChatState } from '@/components/AI';
import {
    AIChatBody,
    AIChatControlButton,
    AIChatDynamicIcon,
    AIChatSubtitle,
} from '@/components/AIChat';
import {
    EmbeddableFrame,
    EmbeddableFrameBody,
    EmbeddableFrameButtons,
    EmbeddableFrameHeader,
    EmbeddableFrameHeaderMain,
    EmbeddableFrameTitle,
} from './EmbeddableFrame';
import { EmbeddableIframeButtons, useEmbeddableConfiguration } from './EmbeddableIframeAPI';

/**
 * Embeddable AI chat window in an iframe.
 */
export function EmbeddableAIChat(props: {
    trademark: boolean;
}) {
    const { trademark } = props;
    const chat = useAIChatState();
    const chatController = useAIChatController();
    const configuration = useEmbeddableConfiguration();

    return (
        <EmbeddableFrame>
            <EmbeddableFrameHeader>
                <AIChatDynamicIcon trademark={trademark} />
                <EmbeddableFrameHeaderMain>
                    <EmbeddableFrameTitle>GitBook Assistant</EmbeddableFrameTitle>
                    <AIChatSubtitle chat={chat} />
                </EmbeddableFrameHeaderMain>
                <EmbeddableFrameButtons>
                    <AIChatControlButton />
                    <EmbeddableIframeButtons />
                </EmbeddableFrameButtons>
            </EmbeddableFrameHeader>
            <EmbeddableFrameBody>
                <AIChatBody
                    trademark={trademark}
                    chatController={chatController}
                    chat={chat}
                    suggestions={configuration.suggestions}
                />
            </EmbeddableFrameBody>
        </EmbeddableFrame>
    );
}
