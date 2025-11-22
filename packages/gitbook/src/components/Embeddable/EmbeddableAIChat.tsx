'use client';

import { useAI, useAIChatController, useAIChatState } from '@/components/AI';
import {
    AIChatBody,
    AIChatControlButton,
    AIChatDynamicIcon,
    AIChatSubtitle,
    getAIChatName,
} from '@/components/AIChat';
import { useLanguage } from '@/intl/client';
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
export function EmbeddableAIChat() {
    const chat = useAIChatState();
    const { config } = useAI();
    const chatController = useAIChatController();
    const configuration = useEmbeddableConfiguration();
    const language = useLanguage();

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
                <AIChatDynamicIcon trademark={config.trademark} />
                <EmbeddableFrameHeaderMain>
                    <EmbeddableFrameTitle>
                        {getAIChatName(language, config.trademark)}
                    </EmbeddableFrameTitle>
                    <AIChatSubtitle chat={chat} />
                </EmbeddableFrameHeaderMain>
                <EmbeddableFrameButtons>
                    <AIChatControlButton />
                    <EmbeddableIframeButtons />
                </EmbeddableFrameButtons>
            </EmbeddableFrameHeader>
            <EmbeddableFrameBody>
                <AIChatBody
                    chatController={chatController}
                    chat={chat}
                    suggestions={configuration.suggestions}
                />
            </EmbeddableFrameBody>
        </EmbeddableFrame>
    );
}
