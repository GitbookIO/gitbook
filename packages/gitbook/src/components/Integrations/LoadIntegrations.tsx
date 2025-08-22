'use client';

import * as React from 'react';
import * as zustand from 'zustand';

import type {
    GitBookGlobal,
    GitBookIntegrationEvent,
    GitBookIntegrationEventCallback,
    GitBookIntegrationTool,
} from '@gitbook/browser-types';
import { type Assistant, globalState } from '../AI';

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
                        pageAction: false,
                    },
                ],
                true
            );

            return () => {
                integrationAssistants.setState((state) => state.filter((a) => a.id !== id), true);
            };
        },
    };
    window.GitBook = gitbookGlobal;

    window.GitBook?.registerTool({
        name: 'ExpandChatSize',
        description:
            'FREE TO USE: Expand the chat to a larger size. Use this tool before you start writing your final answer if you need to show a lot of content, like step-by-step instructions or codeblocks. You do not need to preface this tool with feedback to the user, just call it and the chat will expand.',
        execute: async () => {
            globalState.setState((state) => ({ ...state, size: 'large' }));
            return {
                output: {
                    expanded: true,
                },
                summary: {
                    icon: 'arrow-up-right-and-arrow-down-left-from-center',
                    text: 'Chat size expanded',
                },
            };
        },
    });
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
