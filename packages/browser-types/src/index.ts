import type { AIToolCallResult, AIToolDefinition } from '@gitbook/api';
import type { IconName } from '@gitbook/icons';

export type GitBookIntegrationEvent = 'load' | 'unload';

export type GitBookIntegrationEventCallback = (...args: any[]) => void;

export type GitBookIntegrationToolConfirmation = {
    icon?: IconName;
    label: string;

    /**
     * Supporting context displayed to the user above the confirmation dialog,
     * to help them understand what they are approving or rejecting.
     * Limited to 512 characters.
     */
    context?: string;
};

export type GitBookIntegrationTool = AIToolDefinition & {
    /**
     * Confirmation action to be displayed to the user before executing the tool.
     * Provide a static object, or a function that receives the input provided by
     * the AI assistant and returns the confirmation — useful to display dynamic
     * context based on the arguments the tool is about to be executed with.
     */
    confirmation?:
        | GitBookIntegrationToolConfirmation
        | ((input: object) => GitBookIntegrationToolConfirmation);

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

export type GitBookCookieBannerHandler = (options: {
    onApprove: () => void;
    onReject: () => void;
}) => void;

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

    /**
     * Register a custom cookie banner handler.
     * When registered, the built-in cookie banner will not be displayed.
     */
    registerCookieBanner: (handler: GitBookCookieBannerHandler) => void;

    /**
     * Indicates whether cookies tracking is disabled for the current user.
     * Returns `true` when tracking is disabled, `false` when tracking is enabled,
     * and `undefined` when the tracking preference is unknown or not yet determined.
     */
    isCookiesTrackingDisabled: () => boolean | undefined;

    /**
     * Indicates whether global privacy control is enabled for the current user.
     * Returns `true` when global privacy control is enabled, `false` when it is disabled.
     */
    isGlobalPrivacyControlEnabled: () => boolean;
};

declare global {
    interface Window {
        /**
         * Global `window.GitBook` object accessible by integrations.
         */
        GitBook?: GitBookGlobal;
    }
}
