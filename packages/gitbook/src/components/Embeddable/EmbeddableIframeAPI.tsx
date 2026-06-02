'use client';

import type { GitBookEmbeddableConfiguration, ParentToFrameMessage } from '@gitbook/embed';
import React, { useEffect, useRef } from 'react';

import { useAI, useAIChatController } from '@/components/AI';
import { tString, useLanguage } from '@/intl/client';
import { CustomizationAIMode } from '@gitbook/api';
import { useRouter } from 'next/navigation';
import { createStore, useStore } from 'zustand';
import { integrationsAssistantTools } from '../Integrations';
import { Button, LinkContext, type LinkContextType } from '../primitives';
import { getChannel } from './channel';

const embeddableConfiguration = createStore<GitBookEmbeddableConfiguration>(() => ({
    tabs: [],
    actions: [],
    greeting: { title: '', subtitle: '' },
    suggestions: [],
    tools: [],
    trademark: true,
}));

// biome-ignore lint/suspicious/noExplicitAny: expected
function log(...data: any[]) {
    // biome-ignore lint/suspicious/noConsole: expected
    console.log(...data);
}

/**
 * Expose the API to communicate with the parent window.
 */
export function EmbeddableIframeAPI(props: {
    baseURL: string;
}) {
    const { baseURL } = props;

    const router = useRouter();
    const chatController = useAIChatController();

    // Live ref to avoid adding them as dependencies
    const refs = useRef({ router, chatController, baseURL });
    useEffect(() => {
        refs.current = { router, chatController, baseURL };
    });

    React.useEffect(() => {
        return chatController.on('open', () => {
            const { baseURL, router } = refs.current;
            router.push(`${baseURL}/assistant`);
        });
    }, [chatController]);

    React.useEffect(() => {
        const channel = getChannel();
        if (!channel) {
            return;
        }

        channel.receive((payload) => {
            const { baseURL, router, chatController } = refs.current;
            const message = payload as ParentToFrameMessage;

            log('[gitbook] received message', message);

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
    }, []);

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

export function useEmbeddableTabs() {
    const configuredTabs = useEmbeddableConfiguration((state) => state.tabs);
    return configuredTabs.length > 0 ? configuredTabs : ['assistant', 'search', 'docs'];
}

export function useEmbeddableLinkContext() {
    const tabs = useEmbeddableTabs();
    const hasDocsTab = tabs.includes('docs');
    const currentLinkContext = React.useContext(LinkContext);
    const linkContext: LinkContextType = React.useMemo(
        () =>
            hasDocsTab
                ? { ...currentLinkContext, externalTarget: '_blank' }
                : {
                      ...currentLinkContext,
                      isExternalClient: () => true,
                      isExternalServer: () => true,
                      externalTarget: '_blank',
                  },
        [currentLinkContext, hasDocsTab]
    );

    return { hasDocsTab, linkContext };
}

/**
 * Display the buttons defined by the parent window.
 */
export function EmbeddableIframeButtons() {
    const { actions: configuredActions, buttons: configuredButtons = [] } =
        useEmbeddableConfiguration((state) => state);
    const actions = configuredActions.length > 0 ? configuredActions : configuredButtons;

    return (
        <>
            {actions.length > 0 && (
                <hr className="my-2 border-0 border-tint-subtle border-b first:hidden" />
            )}
            {actions.map((action, index) => (
                <Button
                    data-testid="embed-action"
                    key={action.label}
                    size="large"
                    variant="blank"
                    icon={action?.icon ?? 'square-question'}
                    label={action?.label}
                    iconOnly
                    className="not-hydrated:animate-blur-in-slow [&_.button-leading-icon]:size-5"
                    disabled={!action.onClick}
                    onClick={() => {
                        action.onClick?.();
                    }}
                    tooltipProps={{
                        contentProps: {
                            side: 'right',
                        },
                    }}
                    style={{ animationDelay: `${index * 100}ms` }}
                />
            ))}
        </>
    );
}

export function EmbeddableIframeTabs(props: {
    ref?: React.RefObject<HTMLDivElement | null>;
    active?: string;
    baseURL: string;
    siteTitle: string;
}) {
    const { ref, active = 'assistant', baseURL, siteTitle } = props;
    const actions = useEmbeddableConfiguration((state) => state.actions);
    const tabs = useEmbeddableTabs();

    const { assistants, config } = useAI();
    const language = useLanguage();

    const router = useRouter();

    const enabledTabs = [
        config.aiMode === CustomizationAIMode.Assistant &&
        assistants[0] &&
        tabs.includes('assistant')
            ? {
                  key: 'assistant',
                  label: assistants[0].label,
                  icon: assistants[0].icon,
                  href: `${baseURL}/assistant`,
              }
            : null,
        tabs.includes('search')
            ? {
                  key: 'search',
                  label: tString(language, 'search'),
                  icon: 'search',
                  href: `${baseURL}/search`,
              }
            : null,
        tabs.includes('docs')
            ? {
                  key: 'docs',
                  label: siteTitle,
                  icon: 'book-open',
                  href: `${baseURL}/page/`,
              }
            : null,
    ].filter((tab) => tab !== null);

    // Override the active tab if it doesn't match the configured tabs.
    React.useEffect(() => {
        if (enabledTabs.length === 0) {
            return;
        }

        const activeTab = enabledTabs.find((tab) => tab.key === active);
        const fallbackTab = enabledTabs.at(0);
        if (!activeTab && fallbackTab) {
            router.replace(fallbackTab.href);
        }
    }, [enabledTabs, router, active]);

    return enabledTabs.length > 1 || actions.length > 0 ? (
        <div className="flex flex-col items-center gap-2" ref={ref}>
            {enabledTabs.map((tab) => (
                <Button
                    key={tab.key}
                    data-testid={`embed-tab-${tab.key}`}
                    label={tab.label}
                    size="large"
                    variant="blank"
                    icon={tab.icon}
                    active={tab.key === active}
                    className="not-hydrated:animate-blur-in-slow [&_.button-leading-icon]:size-5"
                    iconOnly
                    onClick={() => {
                        router.push(tab.href);
                    }}
                    tooltipProps={{
                        contentProps: {
                            side: 'right',
                        },
                    }}
                />
            ))}
        </div>
    ) : null;
}

export function EmbeddableIframeCloseButton() {
    const { closeButton } = useEmbeddableConfiguration();

    if (!closeButton) {
        return null;
    }

    return (
        <div className="flex flex-1 flex-col justify-end">
            <Button
                label="Close"
                variant="blank"
                size="large"
                icon="xmark"
                className="not-hydrated:animate-blur-in-slow [&_.button-leading-icon]:size-5"
                iconOnly
                onClick={() => {
                    getChannel()?.send({ type: 'close' });
                }}
                tooltipProps={{
                    contentProps: {
                        side: 'right',
                    },
                }}
            />
        </div>
    );
}
