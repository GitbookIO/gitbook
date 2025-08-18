import type { AIToolCallResult, AIToolDefinition } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';
import type { ReactNode } from 'react';

export type GitBookIntegrationEvent = 'load' | 'unload';

export type GitBookIntegrationEventCallback = (...args: any[]) => void;

export type GitBookIntegrationTool = AIToolDefinition & {
    /**
     * Confirmation action to be displayed to the user before executing the tool.
     */
    confirmation?: {
        icon?: IconName;
        label: string;
    };

    /**
     * Callback when the tool is executed.
     * The input is provided by the AI assistant following the input schema of the tool.
     */
    execute: (input: object) => Promise<Pick<AIToolCallResult, 'output' | 'summary'>>;
};

export type Assistant = {
    id: string;
    label: string;
    icon: ReactNode | string;
    onOpen: (query?: string) => void;
    button?: boolean;
    mode?: 'overlay' | 'sidebar' | 'search';
};

export type GitBookGlobal = {
    /**
     * Register an event listener.
     */
    addEventListener: (
        type: GitBookIntegrationEvent,
        func: GitBookIntegrationEventCallback
    ) => void;

    /**
     * Remove an event listener.
     */
    removeEventListener: (
        type: GitBookIntegrationEvent,
        func: GitBookIntegrationEventCallback
    ) => void;

    /**
     * Register a custom tool to be exposed to the AI assistant.
     */
    registerTool: (tool: GitBookIntegrationTool) => void;

    /**
     * Register a custom assistant to be available on the site.
     */
    registerCustomAssistant: (assistant: Omit<Assistant, 'id' | 'mode'>) => () => void;
};

declare global {
    interface Window {
        /**
         * Global `window.GitBook` object accessible by integrations.
         */
        GitBook?: GitBookGlobal;
    }
}
