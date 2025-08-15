'use client';

import * as React from 'react';
import * as zustand from 'zustand';

export const integrationsEvents = zustand.createStore<{
    /**
     * Events emitted by integrations
     */
    events: Map<GitBookIntegrationEvent, GitBookIntegrationEventCallback[]>;

    /**
     * Register an event listener
     */
    addEventListener: (
        event: GitBookIntegrationEvent,
        callback: GitBookIntegrationEventCallback
    ) => void;

    /**
     * Remove an event listener
     */
    removeEventListener: (
        event: GitBookIntegrationEvent,
        callback: GitBookIntegrationEventCallback
    ) => void;
}>(() => {
    return {
        events: new Map(),
        addEventListener: (event, callback) => {
            const handlers = window.GitBook?.events.get(event) ?? [];
            handlers.push(callback);
            window.GitBook?.events.set(event, handlers);
        },
        removeEventListener: (event, callback) => {
            const handlers = window.GitBook?.events.get(event) ?? [];
            const index = handlers.indexOf(callback);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        },
    };
});

export const integrationsAssistantTools = zustand.createStore<{
    /**
     * Tools exposed to the assistant by integrations
     */
    tools: GitBookIntegrationTool[];

    /**
     * Register a tool with the assistant
     */
    registerTool: (tool: GitBookIntegrationTool) => void;
}>((set) => {
    return {
        tools: [],
        registerTool: (tool: GitBookIntegrationTool) => {
            set((state) => ({
                tools: [...state.tools, tool],
            }));
        },
    };
});

if (typeof window !== 'undefined') {
    window.GitBook = {
        addEventListener: (event, callback) => {
            integrationsEvents.getState().addEventListener(event, callback);
        },
        removeEventListener: (event, callback) => {
            integrationsEvents.getState().removeEventListener(event, callback);
        },
        registerTool: (tool) => {
            integrationsAssistantTools.getState().registerTool(tool);
        },
    };

    window.GitBook?.registerTool({
        name: 'promptToOpenIntercom',
        description:
            'Show a button to user to open the Intercom Messenger to help them reach out to the support. Use this tool when you believe the user should talk to the support.',
        confirmation: {
            label: 'Contact support',
            icon: 'message-arrow-up-right',
        },
        execute: async () => {
            alert('Tada!');
            return {
                output: {},
                summary: {
                    icon: 'message-middle',
                    text: 'Opened chat with support',
                },
            };
        },
    });
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
    integrationsEvents
        .getState()
        .events.get(type)
        ?.forEach((handler) => handler(...args));
}
