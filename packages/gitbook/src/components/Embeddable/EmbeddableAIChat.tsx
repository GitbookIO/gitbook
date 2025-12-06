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
    EmbeddableFrameMain,
    EmbeddableFrameSidebar,
    EmbeddableFrameTitle,
} from './EmbeddableFrame';
import {
    EmbeddableIframeButtons,
    EmbeddableIframeTabs,
    useEmbeddableConfiguration,
} from './EmbeddableIframeAPI';

type EmbeddableAIChatProps = {
    baseURL: string;
    siteTitle: string;
};

/**
 * Embeddable AI chat window in an iframe.
 */
export function EmbeddableAIChat(props: EmbeddableAIChatProps) {
    const { baseURL, siteTitle } = props;
    const chat = useAIChatState();
    const { config } = useAI();
    const chatController = useAIChatController();
    const configuration = useEmbeddableConfiguration();
    const language = useLanguage();

    React.useEffect(() => {
        chatController.open();
    }, [chatController]);

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

    const tabsRef = React.useRef<HTMLDivElement>(null);

    return (
        <EmbeddableFrame>
            <EmbeddableFrameSidebar>
                <EmbeddableIframeTabs
                    ref={tabsRef}
                    active="assistant"
                    baseURL={baseURL}
                    siteTitle={siteTitle}
                />
                <EmbeddableIframeButtons />
            </EmbeddableFrameSidebar>
            <EmbeddableFrameMain data-testid="ai-chat">
                <EmbeddableFrameHeader>
                    {!tabsRef.current ? (
                        <AIChatDynamicIcon
                            className="animate-blur-in-slow"
                            trademark={config.trademark}
                        />
                    ) : null}
                    <EmbeddableFrameHeaderMain>
                        <EmbeddableFrameTitle>
                            {getAIChatName(language, config.trademark)}
                        </EmbeddableFrameTitle>
                        <AIChatSubtitle chat={chat} />
                    </EmbeddableFrameHeaderMain>
                    <EmbeddableFrameButtons>
                        <AIChatControlButton />
                    </EmbeddableFrameButtons>
                </EmbeddableFrameHeader>
                <EmbeddableFrameBody>
                    <AIChatBody
                        chatController={chatController}
                        chat={chat}
                        suggestions={configuration.suggestions}
                    />
                </EmbeddableFrameBody>
            </EmbeddableFrameMain>
        </EmbeddableFrame>
    );
}
