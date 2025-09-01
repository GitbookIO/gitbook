'use client';

import { useAIChatController, useAIChatState } from '@/components/AI';
import {
    AIChatBody,
    AIChatControlButton,
    AIChatDynamicIcon,
    AIChatSubtitle,
} from '@/components/AIChat';
import * as api from '@gitbook/api';
import React from 'react';
import { useTrackEvent } from '../Insights';
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

    // Track the view of the AI chat
    const trackEvent = useTrackEvent();
    React.useEffect(() => {
        trackEvent(
            {
                type: 'ask_view',
            },
            {
                pageId: null,
                displayContext: api.SiteInsightsDisplayContext.Embed,
            }
        );
    }, [trackEvent]);

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
