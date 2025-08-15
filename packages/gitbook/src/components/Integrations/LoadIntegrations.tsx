'use client';

import * as React from 'react';
import * as zustand from 'zustand';

interface CustomAssistant {
    id: string;
    label: string;
    icon: string;
    onOpen: (query?: string) => void;
}

export const customAssistants = zustand.createStore<{
    assistants: Array<CustomAssistant>;
    registerAssistant: (assistant: Omit<CustomAssistant, 'id'>) => () => void;
}>((set) => ({
    assistants: [],
    registerAssistant: (assistant) => {
        const id = window.crypto.randomUUID();
        set((state) => ({
            assistants: [...state.assistants, { ...assistant, id }],
        }));

        return () => {
            set((state) => ({
                assistants: state.assistants.filter((a) => a.id !== id),
            }));
        };
    },
}));

if (typeof window !== 'undefined') {
    window.GitBook = {
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
        registerCustomAssistant: (assistant) => {
            return customAssistants.getState().registerAssistant(assistant);
        },
    };
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
    const handlers = window.GitBook?.events.get(type) || [];
    handlers.forEach((handler) => handler(...args));
}
