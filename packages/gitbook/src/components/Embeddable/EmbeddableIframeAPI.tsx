'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { createStore, useStore } from 'zustand';

import type { GitBookEmbeddableConfiguration, ParentToFrameMessage } from '@gitbook/embed';

import { integrationsAssistantTools } from '../Integrations';
import { Button, LinkContext, type LinkContextType } from '../primitives';
import { getChannel } from './channel';
import { DEFAULT_EMBEDDABLE_TABS, getEmbeddableLandingTab } from './getEmbeddableLandingTab';
import { resolveEmbedPageLink } from './server-actions';
import { useAI, useAIChatController } from '@/components/AI';
import { isAIChatEnabled } from '@/components/utils/isAIChatEnabled';
import { tString, useLanguage } from '@/intl/client';

const embeddableConfiguration = createStore<GitBookEmbeddableConfiguration>(() => ({
    tabs: [],
    actions: [],
    greeting: { title: '', subtitle: '' },
    suggestions: [],
    tools: [],
    trademark: true,
}));

const docsHome = createStore<{ reference?: string; href?: string }>(() => ({}));

// Module-level so it survives the layout remounting on a cross-space navigation.
let landed = false;

function resolvePageHref(pagePath: string, baseURL: string): Promise<string> {
    return resolveEmbedPageLink(pagePath)
        .then((resolved) => ('href' in resolved ? resolved.href : `${baseURL}/page/${pagePath}`))
        .catch(() => `${baseURL}/page/${pagePath}`);
}

// oxlint-disable-next-line typescript/no-explicit-any
function log(...data: any[]) {
    // oxlint-disable-next-line no-console
    console.log(...data);
}

/**
 * Expose the API to communicate with the parent window.
 */
export function EmbeddableIframeAPI(props: { baseURL: string }) {
    const { baseURL } = props;

    const router = useRouter();
    const chatController = useAIChatController();

    // Live ref to avoid adding them as dependencies
    const refs = useRef({ router, chatController, baseURL });
    useEffect(() => {
        refs.current = { router, chatController, baseURL };
    });

    // Bumped on every navigation so an in-flight (async) `navigateToPage` can tell it has
    // been superseded by a later command and skip its now-stale `router.push`.
    const navToken = useRef(0);

    React.useEffect(() => {
        return chatController.on('open', () => {
            const { baseURL, router } = refs.current;
            navToken.current++;
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

            const navigate = (href: Promise<string>) => {
                const token = ++navToken.current;
                href.then((href) => {
                    if (navToken.current === token) {
                        refs.current.router.push(href);
                    }
                });
            };

            log('[gitbook] received message', message);

            switch (message.type) {
                case 'clearChat': {
                    chatController.clear();
                    break;
                }
                case 'postUserMessage': {
                    // The answer renders in the assistant, so bring it up if another tab is showing.
                    navToken.current++;
                    router.push(`${baseURL}/assistant`);
                    chatController.postMessage({
                        message: message.message,
                    });
                    break;
                }
                case 'configure': {
                    const { settings } = message;
                    embeddableConfiguration.setState(settings);
                    integrationsAssistantTools.setState({
                        tools: settings.tools,
                    });

                    const defaultPage =
                        typeof settings.defaultPage === 'string' && settings.defaultPage
                            ? settings.defaultPage
                            : undefined;
                    let docsHomeHref: Promise<string> | undefined;
                    if (defaultPage !== docsHome.getState().reference) {
                        docsHome.setState({ reference: defaultPage, href: undefined });
                        if (defaultPage) {
                            docsHomeHref = resolvePageHref(defaultPage, baseURL);
                            docsHomeHref.then((href) => {
                                if (docsHome.getState().reference === defaultPage) {
                                    docsHome.setState({ href });
                                }
                            });
                        }
                    }

                    if (!landed) {
                        landed = true;
                        const tab = getEmbeddableLandingTab(settings);
                        if (tab === 'docs') {
                            navigate(docsHomeHref ?? Promise.resolve(`${baseURL}/page/`));
                        } else if (tab) {
                            navToken.current++;
                            router.push(`${baseURL}/${tab}`);
                        }
                    }
                    break;
                }
                case 'navigateToPage': {
                    navigate(resolvePageHref(message.pagePath, baseURL));
                    break;
                }
                case 'navigateToAssistant': {
                    navToken.current++;
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
    return configuredTabs.length > 0 ? configuredTabs : DEFAULT_EMBEDDABLE_TABS;
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
                <hr className="my-2 border-0 border-b border-tint-subtle first:hidden" />
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
                    tooltipProps={{ side: 'right' }}
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
    onNavigate?: (href: string) => void;
}) {
    const { ref, active = 'assistant', baseURL, siteTitle, onNavigate } = props;
    const actions = useEmbeddableConfiguration((state) => state.actions);
    const tabs = useEmbeddableTabs();
    const docsHomeHref = useStore(docsHome, (state) => state.href);

    const { assistants, config } = useAI();
    const language = useLanguage();

    const router = useRouter();

    const enabledTabs = [
        isAIChatEnabled(config.aiMode) && assistants[0] && tabs.includes('assistant')
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
                  href: docsHomeHref ?? `${baseURL}/page/`,
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
                        if (tab.key !== active && onNavigate) {
                            onNavigate(tab.href);
                            return;
                        }
                        router.push(tab.href);
                    }}
                    tooltipProps={{ side: 'right' }}
                />
            ))}
        </div>
    ) : null;
}

export function EmbeddableIframeCloseButton(props: { onClose?: () => void }) {
    const { onClose } = props;
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
                    onClose?.();
                    getChannel()?.send({ type: 'close' });
                }}
                tooltipProps={{ side: 'right' }}
            />
        </div>
    );
}
