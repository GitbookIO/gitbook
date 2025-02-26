declare global {
    type GitBookIntegrationEvent = 'load' | 'unload';

    type GitBookIntegrationEventCallback = (...args: any[]) => void;

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
        };
    }
}

export {};
