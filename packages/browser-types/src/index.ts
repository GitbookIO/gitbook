import type { AIToolCallResult, AIToolDefinition } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

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

export type GitBookAssistant = {
    /**
     * Name of the assistant displayed in the UI.
     */
    label: string;

    /**
     * Icon of the assistant displayed in the UI.
     * Any FontAwesome icon name is supported.
     * @example 'sparkle'
     */
    icon: string;

    /**
     * Callback when the assistant is opened.
     */
    open: (query?: string) => void;

    /**
     * Whether to display the triggers for this assistant in the UI.
     * @default true
     */
    ui?: boolean;
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
    registerAssistant: (assistant: GitBookAssistant) => () => void;
};

declare global {
    interface Window {
        /**
         * Global `window.GitBook` object accessible by integrations.
         */
        GitBook?: GitBookGlobal;
    }
}
