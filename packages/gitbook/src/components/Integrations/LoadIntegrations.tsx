'use client';

import * as React from 'react';
import * as zustand from 'zustand';

import type {
    GitBookGlobal,
    GitBookIntegrationEvent,
    GitBookIntegrationEventCallback,
    GitBookIntegrationTool,
} from '@gitbook/browser-types';

import type { Assistant } from '../AI';
import {
    isCookiesTrackingDisabled,
    isGlobalPrivacyControlEnabled,
    setCookiesTracking,
} from '@/components/Insights';
import { isAIUserAgent } from '@/lib/browser';

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

export const integrationAssistants = zustand.createStore<Assistant[]>(() => []);

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
export function useIntegrationAssistants(): Assistant[] {
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
 * Dispatch the `load` event to all integrations.
 */
export function LoadIntegrations() {
    React.useEffect(() => {
        return whenIntegrationsReady(() => {
            dispatchGitBookIntegrationEvent('load');
            integrationsStore.setState({ loaded: true });
        });
    }, []);
    return null;
}

/**
 * Run `callback` once the integrations have had their chance to register.
 *
 * Consent integrations register their cookie banner from a `load` listener, so treating
 * integrations as loaded at hydration flashed our own cookie banner on sites that ship
 * their own.
 */
function whenIntegrationsReady(callback: () => void): () => void {
    if (document.readyState === 'complete') {
        callback();
        return () => {};
    }

    // Their listener is registered after ours when their script runs after hydration.
    const onLoad = () => setTimeout(callback, 0);
    window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
}

/**
 * Client function to dispatch a GitBook event.
 */
function dispatchGitBookIntegrationEvent(type: GitBookIntegrationEvent, ...args: unknown[]) {
    events.get(type)?.forEach((handler) => handler(...args));
}
