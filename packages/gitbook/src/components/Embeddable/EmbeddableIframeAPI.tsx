'use client';

import type { GitBookEmbeddableConfiguration, ParentToFrameMessage } from '@gitbook/embed';
import { createChannel } from 'bidc';
import React from 'react';

import { useAI, useAIChatController } from '@/components/AI';
import { CustomizationAIMode } from '@gitbook/api';
import { useRouter } from 'next/navigation';
import { createStore, useStore } from 'zustand';
import { integrationsAssistantTools } from '../Integrations';
import { Button } from '../primitives';

const embeddableConfiguration = createStore<
    GitBookEmbeddableConfiguration & { baseURL: string; siteTitle: string }
>(() => ({
    tabs: [],
    actions: [],
    greeting: { title: '', subtitle: '' },
    suggestions: [],
    tools: [],
    baseURL: '',
    siteTitle: '',
}));

/**
 * Expose the API to communicate with the parent window.
 */
export function EmbeddableIframeAPI(props: {
    baseURL: string;
    siteTitle: string;
}) {
    const { baseURL, siteTitle } = props;

    const router = useRouter();
    const chatController = useAIChatController();

    React.useEffect(() => {
        embeddableConfiguration.setState({ baseURL });
        embeddableConfiguration.setState({ siteTitle });
    }, [baseURL, siteTitle]);

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
export function useEmbeddableConfiguration<
    T = GitBookEmbeddableConfiguration & { baseURL: string; siteTitle: string },
>(
    // @ts-expect-error - This is a workaround to allow the function to be optional.
    fn: (state: GitBookEmbeddableConfiguration) => T = (state) => state
) {
    return useStore(embeddableConfiguration, fn);
}

/**
 * Display the buttons defined by the parent window.
 */
export function EmbeddableIframeButtons() {
    const actions = useEmbeddableConfiguration((state) => state.actions);

    return (
        <>
            {actions.length > 0 && (
                <hr className="my-2 border-0 border-tint-subtle border-b first:hidden" />
            )}
            {actions.map((action, index) => (
                <Button
                    key={action.label}
                    size="default"
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

export function EmbeddableIframeTabs(props: { active?: string }) {
    const { active = 'assistant' } = props;
    let { tabs: configuredTabs, actions } = useEmbeddableConfiguration();

    if (configuredTabs.length === 0) {
        configuredTabs = ['assistant', 'docs'];
    }

    const { assistants, config } = useAI();

    const router = useRouter();
    const { baseURL, siteTitle } = useEmbeddableConfiguration();

    // Override the active tab if it doesn't match the configured tabs
    React.useEffect(() => {
        if (active === 'assistant' && !configuredTabs.includes('assistant')) {
            router.replace(`${baseURL}/page`);
        } else if (active === 'docs' && !configuredTabs.includes('docs')) {
            router.replace(`${baseURL}/assistant`);
        }
    }, [configuredTabs, baseURL, router, active]);

    const tabs = [
        config.aiMode === CustomizationAIMode.Assistant &&
        assistants[0] &&
        configuredTabs.includes('assistant')
            ? {
                  key: 'assistant',
                  label: assistants[0].label,
                  icon: assistants[0].icon,
                  onClick: () => {
                      router.push(`${baseURL}/assistant`);
                  },
              }
            : null,
        configuredTabs.includes('docs')
            ? {
                  key: 'docs',
                  label: siteTitle,
                  icon: 'book-open',
                  onClick: () => {
                      router.push(`${baseURL}/page/`);
                  },
              }
            : null,
    ].filter((tab) => tab !== null);

    return (
        <>
            {tabs.length > 1 || actions.length > 0
                ? tabs.map((tab) => (
                      <Button
                          key={tab.key}
                          label={tab.label}
                          size="default"
                          variant="blank"
                          icon={tab.icon}
                          active={tab.key === active}
                          className="not-hydrated:animate-blur-in-slow [&_.button-leading-icon]:size-5"
                          iconOnly
                          onClick={tab.onClick}
                          tooltipProps={{
                              contentProps: {
                                  side: 'right',
                              },
                          }}
                      />
                  ))
                : null}
        </>
    );
}
