import { ContentKitAction, RequestRenderIntegrationUI } from '@gitbook/api';
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

export interface ContentKitClientContextType {
    security: ContentKitSecurity;

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
    null,
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
