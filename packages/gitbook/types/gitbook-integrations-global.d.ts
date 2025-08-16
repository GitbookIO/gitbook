import type { AIToolCallResult, AIToolDefinition } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

declare global {
    type GitBookIntegrationEvent = 'load' | 'unload';

    type GitBookIntegrationEventCallback = (...args: any[]) => void;

    type GitBookIntegrationTool = AIToolDefinition & {
        /**
         * Confirmation action to be displayed to the user before executing the tool.
         */
        confirmation: {
            icon?: IconName;
            label: string;
        };

        /**
         * Execute the tool.
         */
        execute: (input: object) => Promise<Pick<AIToolCallResult, 'output' | 'summary'>>;
    };

    interface Window {
        /**
         * Global `window.GitBook` object accessible by integrations.
         */
        GitBook?: {
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
        };
    }
}
