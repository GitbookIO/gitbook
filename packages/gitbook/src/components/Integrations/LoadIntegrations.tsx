'use client';

import {
    isCookiesTrackingDisabled,
    isGlobalPrivacyControlEnabled,
    setCookiesTracking,
} from '@/components/Insights';
import { isAIUserAgent } from '@/lib/browser';
import type {
    GitBookGlobal,
    GitBookIntegrationEvent,
    GitBookIntegrationEventCallback,
    GitBookIntegrationTool,
} from '@gitbook/browser-types';
import * as React from 'react';
import * as zustand from 'zustand';
import type { Assistant } from '../AI';
import { filterScriptsByConsent, type IntegrationScript } from './scripts';

const events = new Map<GitBookIntegrationEvent, GitBookIntegrationEventCallback[]>();

export const integrationsAssistantTools = zustand.createStore<{
    /**
     * Tools exposed to the assistant by integrations
     */
    tools: GitBookIntegrationTool[];
}>(() => {
    return {
        tools: [],
    };
});

export const integrationAssistants = zustand.createStore<Array<Assistant>>(() => []);

// Store to track when integrations have been loaded
export const integrationsStore = zustand.createStore<{
    loaded: boolean;
}>(() => {
    return {
        loaded: false,
    };
});

type CustomCookieBannerStore = {
    hasCustomCookieBanner: boolean;
};

// Store for custom cookie banner registration
export const customCookieBannerStore = zustand.createStore<CustomCookieBannerStore>(() => {
    return {
        hasCustomCookieBanner: false,
    };
});

if (typeof window !== 'undefined') {
    const gitbookGlobal: GitBookGlobal = {
        addEventListener: (event, callback) => {
            const handlers = events.get(event) ?? [];
            handlers.push(callback);
            events.set(event, handlers);
        },
        removeEventListener: (event, callback) => {
            const handlers = events.get(event) ?? [];
            const index = handlers.indexOf(callback);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        },
        registerTool: (tool) => {
            integrationsAssistantTools.setState((state) => ({
                tools: [...state.tools, tool],
            }));
        },
        registerAssistant: (assistant) => {
            const id = window.crypto.randomUUID();
            integrationAssistants.setState(
                (state) => [
                    ...state,
                    {
                        ...assistant,
                        id,
                        ui: assistant.ui ?? true,
                        mode: 'overlay',
                        pageAction: false,
                    },
                ],
                true
            );

            return () => {
                integrationAssistants.setState((state) => state.filter((a) => a.id !== id), true);
            };
        },
        registerCookieBanner: (handler) => {
            // Do not register cookie banner for AI UserAgents (crawlers, AI-assisted browsers)
            if (isAIUserAgent()) {
                return;
            }

            customCookieBannerStore.setState((state) => ({
                ...state,
                hasCustomCookieBanner: true,
            }));

            handler({
                onApprove: () => {
                    setCookiesTracking(true);
                    window.location.reload();
                },
                onReject: () => {
                    setCookiesTracking(false);
                    window.location.reload();
                },
            });
        },
        isCookiesTrackingDisabled: isCookiesTrackingDisabled,
        isGlobalPrivacyControlEnabled: isGlobalPrivacyControlEnabled,
    };
    window.GitBook = gitbookGlobal;
}

/**
 * Get the current state of the assistants.
 */
export function useIntegrationAssistants(): Array<Assistant> {
    return zustand.useStore(integrationAssistants);
}

/**
 * Hook to check if integrations have been loaded.
 */
export function useIntegrationsLoaded(): boolean {
    return zustand.useStore(integrationsStore, (state) => state.loaded);
}

/**
 * Hook to check if a custom cookie banner is registered.
 */
export function useCustomCookieBanner(): CustomCookieBannerStore {
    return zustand.useStore(customCookieBannerStore);
}

/**
 * Dispatch the `load` event after all eligible integrations have been loaded.
 */
export function LoadIntegrations(props: { scripts: IntegrationScript[] }) {
    const { scripts } = props;
    const [hasExplicitCookieConsent, setHasExplicitCookieConsent] = React.useState(false);
    const loadedScriptsRef = React.useRef(new Set<string>());
    const hasInitializedRef = React.useRef(false);

    React.useEffect(() => {
        setHasExplicitCookieConsent(isCookiesTrackingDisabled() === false);
    }, []);

    React.useEffect(() => {
        const eligibleScripts = filterScriptsByConsent(scripts, hasExplicitCookieConsent);
        const pendingScripts = eligibleScripts.filter(
            ({ script }) => !loadedScriptsRef.current.has(script)
        );

        if (pendingScripts.length === 0) {
            if (!hasInitializedRef.current) {
                dispatchGitBookIntegrationEvent('load');
                integrationsStore.setState({ loaded: true });
                hasInitializedRef.current = true;
            }
            return;
        }

        let cancelled = false;

        Promise.all(
            pendingScripts.map(({ script }) =>
                loadIntegrationScript(script).finally(() => {
                    loadedScriptsRef.current.add(script);
                })
            )
        ).then(() => {
            if (cancelled) {
                return;
            }

            dispatchGitBookIntegrationEvent('load');

            if (!hasInitializedRef.current) {
                integrationsStore.setState({ loaded: true });
                hasInitializedRef.current = true;
            }
        });

        return () => {
            cancelled = true;
        };
    }, [hasExplicitCookieConsent, scripts]);

    return null;
}

function loadIntegrationScript(src: string): Promise<void> {
    if (document.querySelector(`script[src="${CSS.escape(src)}"]`)) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const element = document.createElement('script');
        element.async = true;
        element.src = src;
        element.onload = () => resolve();
        element.onerror = () => resolve();
        document.body.appendChild(element);
    });
}

/**
 * Client function to dispatch a GitBook event.
 */
function dispatchGitBookIntegrationEvent(type: GitBookIntegrationEvent, ...args: unknown[]) {
    events.get(type)?.forEach((handler) => handler(...args));
}
