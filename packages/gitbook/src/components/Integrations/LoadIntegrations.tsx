'use client';

import * as React from 'react';
import * as zustand from 'zustand';

import type {
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
            integrationsAssistantTools.getState().registerTool(tool);
        },
    };
    window.GitBook = gitbookGlobal;
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
