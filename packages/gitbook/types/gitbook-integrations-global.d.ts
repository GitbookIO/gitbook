declare global {
    type GitBookIntegrationEvent = 'load' | 'unload';

    type GitBookIntegrationEventCallback = (...args: any[]) => void;

    interface GitBookIntegrationCustomAssistant {
        /**
         * Label for the custom assistant
         */
        label: string;
        /**
         * Icon for the custom assistant.
         * @example robot
         *
         * Refer to `@gitbook/icons` for a complete list of icons.
         */
        icon: string;
        /**
         * Called when the custom assistant is opened.
         * @param query The query string to process.
         */
        onOpen: (query?: string) => void;
    }

    interface Window {
        /**
         * Global `window.GitBook` object accessible by integrations.
         */
        GitBook?: {
            events: Map<GitBookIntegrationEvent, GitBookIntegrationEventCallback[]>;
            addEventListener: (
                type: GitBookIntegrationEvent,
                func: GitBookIntegrationEventCallback
            ) => void;
            removeEventListener: (
                type: GitBookIntegrationEvent,
                func: GitBookIntegrationEventCallback
            ) => void;
            /**
             * Register a custom assistant for the GitBook site.
             * @returns A function to unregister the custom assistant.
             */
            registerCustomAssistant: (assistant: GitBookIntegrationCustomAssistant) => () => void;
        };
    }
}

export {};
