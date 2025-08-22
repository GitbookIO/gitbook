import { createChannel } from 'bidc';
import type {
    FrameToParentMessage,
    GitBookPlaceholderSettings,
    GitBookToolDefinition,
    ParentToFrameMessage,
} from './protocol';

export type GitBookFrameClient = {
    /**
     * Navigate to a page by its path.
     */
    navigateToPage: (path: string) => void;

    /**
     * Navigate to the assistant.
     */
    navigateToAssistant: () => void;

    /**
     * Post a message to the chat.
     */
    postUserMessage: (message: string) => void;

    /**
     * Register a custom tool.
     */
    registerTool: (tool: GitBookToolDefinition) => void;

    /**
     * Clear the chat.
     */
    clearChat: () => void;

    /**
     * Set the placeholder settings.
     */
    setPlaceholder: (placeholder: GitBookPlaceholderSettings) => void;

    /**
     * Register an event listener.
     */
    on: (event: string, listener: (...args: any[]) => void) => () => void;
};

/**
 * Create a client to communicate with the GitBook Assistant frame.
 */
export function createGitBookFrame(iframe: HTMLIFrameElement): GitBookFrameClient {
    if (!iframe.contentWindow) {
        throw new Error('Iframe must have a content window');
    }
    const channel = createChannel(iframe.contentWindow);

    channel.receive((message: FrameToParentMessage) => {
        if (message.type === 'close') {
            const listeners = events.get('close') || [];
            if (listeners) {
                listeners.forEach((listener) => listener());
            }
        }
    });

    const sendToFrame = (message: ParentToFrameMessage) => {
        channel.send(message);
    };

    const events = new Map<string, Array<(...args: any[]) => void>>();

    return {
        navigateToPage: (pagePath) => {
            sendToFrame({ type: 'navigateToPage', pagePath });
        },
        navigateToAssistant: () => {
            sendToFrame({ type: 'navigateToAssistant' });
        },
        postUserMessage: (message) => sendToFrame({ type: 'postUserMessage', message }),
        registerTool: (tool) => sendToFrame({ type: 'registerTool', tool }),
        clearChat: () => sendToFrame({ type: 'clearChat' }),
        setPlaceholder: (settings) => sendToFrame({ type: 'setPlaceholder', settings }),
        on: (event, listener) => {
            const listeners = events.get(event) || [];
            listeners.push(listener);
            events.set(event, listeners);
            return () => {
                events.set(
                    event,
                    listeners.filter((l) => l !== listener)
                );
            };
        },
    };
}
