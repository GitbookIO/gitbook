import type { AIToolCallResult, AIToolDefinition } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

declare global {
    type GitBookIntegrationEvent = 'load' | 'unload';

    type GitBookIntegrationEventCallback = (...args: any[]) => void;

    type GitBookIntegrationTool = {
        /**
         * Name of the tool.
         */
        name: string;

        /**
         * Description of the tool.
         * It'll not be displayed to the user, but will be passed to the AI assistant
         * to understand the tool and its capabilities.
         */
        description: string;

        /**
         * Confirmation action to be displayed to the user before executing the tool.
         */
        confirmation: {
            icon?: IconName;
            label: string;
        };

        /**
         * Input schema of the tool.
         */
        inputSchema?: AIToolDefinition['inputSchema'];

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
