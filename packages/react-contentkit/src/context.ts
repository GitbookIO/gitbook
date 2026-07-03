import type { ContentKitAction, RequestRenderIntegrationUI } from '@gitbook/api';
import * as React from 'react';

/**
 * Security restrictions for elements.
 */
export interface ContentKitSecurity {
    /**
     * Domains allowed for webframe communication.
     * These domains will be allowed to send messages to ContentKit,
     * and receive messages from ContentKit.
     */
    firstPartyDomains: string[];
}

export type ContentKitRenderUpdate = Partial<
    Pick<RequestRenderIntegrationUI, 'action' | 'props' | 'state'>
>;

export type ContentKitClientContextData = {
    /**
     * Client-only visitor claims, merged into the webframe state.
     * Gated by the integration's visitor-claims scope.
     */
    getVisitorContext?: () =>
        | Record<string, unknown>
        | null
        | undefined
        | Promise<Record<string, unknown> | null | undefined>;

    /**
     * Client-only current-page context, merged into the webframe state.
     */
    getPageContext?: () =>
        | Record<string, unknown>
        | null
        | undefined
        | Promise<Record<string, unknown> | null | undefined>;

    /**
     * Navigate the host page to another page, in response to a webframe `@webframe.navigate`
     * action. The host is responsible for resolving `path` within the current content and for
     * restricting navigation to trusted destinations.
     */
    navigate?: (target: { path: string; anchor?: string }) => void;
};

export interface ContentKitClientContextType {
    security: ContentKitSecurity;

    /**
     * Client-only contextual data for client-rendered elements such as webframes.
     * This data must not be included in integration render requests.
     */
    clientContext?: ContentKitClientContextData;

    /**
     * Current value of the state.
     */
    state: object;

    /**
     * Update the state.
     */
    setState: React.Dispatch<React.SetStateAction<object>>;

    /**
     * Re-render the ContentKit component with a new set of props/state or an action.
     */
    update: (newState: ContentKitRenderUpdate) => Promise<void>;

    /**
     * Dispatch an action.
     */
    dispatchAction: (action: ContentKitAction, bubble?: boolean) => Promise<void>;
}

export const ContentKitClientContext = React.createContext<ContentKitClientContextType | null>(
    null
);

/**
 * Get the current contentkit context.
 */
export function useContentKitClientContext(): ContentKitClientContextType {
    const context = React.useContext(ContentKitClientContext);
    if (!context) {
        throw new Error('ContentKit component should be wrapped in <ContentKit>');
    }
    return context;
}
