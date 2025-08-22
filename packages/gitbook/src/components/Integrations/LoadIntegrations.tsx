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
                        pageAction: undefined,
                    },
                ],
                true
            );

            const close = () => {
                // We don't have access to the search state here, so we need to
                // manually remove the `ask` query parameter from the URL.
                try {
                    const url = new URL(window.location.href);
                    if (url.searchParams.has('ask')) {
                        url.searchParams.delete('ask');
                        window.history.replaceState(
                            {},
                            '',
                            `${url.pathname}${url.search}${url.hash}`
                        );
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                } catch (error) {
                    console.error('Failed to remove `ask` query parameter from URL.', error);
                }
            };

            const dispose = () => {
                integrationAssistants.setState((state) => state.filter((a) => a.id !== id), true);
            };

            return { close, dispose };
        },
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
 * Dispatch the `load` event to all integrations.
 */
export function LoadIntegrations() {
    React.useEffect(() => {
        dispatchGitBookIntegrationEvent('load');
    }, []);
    return null;
}

/**
 * Client function to dispatch a GitBook event.
 */
function dispatchGitBookIntegrationEvent(type: GitBookIntegrationEvent, ...args: any[]) {
    events.get(type)?.forEach((handler) => handler(...args));
}
