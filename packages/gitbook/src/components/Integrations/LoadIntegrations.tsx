'use client';

import * as React from 'react';
import * as zustand from 'zustand';

import type {
    Assistant,
    GitBookGlobal,
    GitBookIntegrationEvent,
    GitBookIntegrationEventCallback,
    GitBookIntegrationTool,
} from '@gitbook/browser-types';

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

export const customAssistants = zustand.createStore<{
    assistants: Array<Assistant>;
    registerAssistant: (assistant: Omit<Assistant, 'id' | 'mode'>) => () => void;
}>((set) => ({
    assistants: [],
    registerAssistant: (assistant) => {
        const id = window.crypto.randomUUID();
        set((state) => ({
            assistants: [
                ...state.assistants,
                { ...assistant, id, button: assistant.button ?? true, mode: 'overlay' },
            ],
        }));

        return () => {
            set((state) => ({
                assistants: state.assistants.filter((a) => a.id !== id),
            }));
        };
    },
}));

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
        registerCustomAssistant: (assistant) => {
            return customAssistants.getState().registerAssistant(assistant);
        },
    };
    window.GitBook = gitbookGlobal;
}

/**
 * Get the current state of the assistants.
 */
export function useCustomAssistants(): Array<Assistant> {
    return zustand.useStore(customAssistants, (state) => state.assistants);
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
