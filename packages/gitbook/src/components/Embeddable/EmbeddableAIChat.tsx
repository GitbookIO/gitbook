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
import { LinkContext } from '../primitives';
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
    EmbeddableIframeCloseButton,
    EmbeddableIframeTabs,
    useEmbeddableLinkContext,
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
    const { config: siteConfig } = useAI();
    const chatController = useAIChatController();
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
    const trademark = siteConfig.trademark;
    const { linkContext } = useEmbeddableLinkContext();

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
                <EmbeddableIframeCloseButton />
            </EmbeddableFrameSidebar>
            <EmbeddableFrameMain data-testid="ai-chat">
                <EmbeddableFrameHeader>
                    {!tabsRef.current ? (
                        <AIChatDynamicIcon className="animate-blur-in-slow" trademark={trademark} />
                    ) : null}
                    <EmbeddableFrameHeaderMain>
                        <EmbeddableFrameTitle>
                            {siteConfig.assistantName ?? getAIChatName(language, trademark)}
                        </EmbeddableFrameTitle>
                        <AIChatSubtitle chat={chat} />
                    </EmbeddableFrameHeaderMain>
                    <EmbeddableFrameButtons>
                        <AIChatControlButton />
                    </EmbeddableFrameButtons>
                </EmbeddableFrameHeader>
                <EmbeddableFrameBody>
                    <LinkContext value={linkContext}>
                        <AIChatBody
                            chatController={chatController}
                            chat={chat}
                            suggestions={siteConfig.suggestions}
                            greeting={siteConfig.greeting}
                            trademark={trademark}
                        />
                    </LinkContext>
                </EmbeddableFrameBody>
            </EmbeddableFrameMain>
        </EmbeddableFrame>
    );
}
