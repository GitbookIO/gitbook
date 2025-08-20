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
            // Add assistant with ready=false until the integration signals readiness
            integrationAssistants.setState(
                (state) => [
                    ...state,
                    { ...assistant, id, ui: assistant.ui ?? true, mode: 'overlay', ready: false },
                ],
                true
            );

            const ready = () => {
                integrationAssistants.setState(
                    (state) =>
                        state.map((assistant) =>
                            assistant.id === id ? { ...assistant, ready: true } : assistant
                        ),
                    true
                );
            };

            const dispose = () => {
                integrationAssistants.setState(
                    (state) => state.filter((assistant) => assistant.id !== id),
                    true
                );
            };

            const registration = (() => dispose()) as ((this: void) => void) & {
                ready: () => void;
                dispose: () => void;
            };
            registration.ready = ready;
            registration.dispose = dispose;
            return registration;
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
function dispatchGitBookIntegrationEvent(type: GitBookIntegrationEvent, ...args: unknown[]) {
    events.get(type)?.forEach((handler) => handler(...args));
}
