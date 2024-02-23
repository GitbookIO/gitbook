declare global {
    type GitBookIntegrationEvent = 'load' | 'unload';

    interface Window {
        /**
         * Global `window.GitBook` object accessible by integrations.
         */
        GitBook?: {
            events: Map<GitBookIntegrationEvent, Function[]>;
            addEventListener: (type: GitBookIntegrationEvent, func: Function) => void;
            removeEventListener: (type: GitBookIntegrationEvent, func: Function) => void;
        };
    }
}

export {};
