import { createChannel } from 'bidc';
import type {
    FrameToParentMessage,
    GitBookEmbeddableConfiguration,
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
     * Clear the chat.
     */
    clearChat: () => void;

    /**
     * Set the placeholder settings.
     */
    configure: (settings: Partial<GitBookEmbeddableConfiguration>) => void;

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
        console.log('[gitbook:embed] received message', message);
        if (message.type === 'close') {
            const listeners = events.get('close') || [];
            if (listeners) {
                listeners.forEach((listener) => listener());
            }
        }
    });

    const sendToFrame = (message: ParentToFrameMessage) => {
        console.log('[gitbook:embed] send message', message);
        channel.send(message);
    };

    const events = new Map<string, Array<(...args: any[]) => void>>();

    const configuration: GitBookEmbeddableConfiguration = {
        buttons: [],
        welcomeMessage: '',
        suggestions: [],
        tools: [],
    };

    return {
        navigateToPage: (pagePath) => {
            sendToFrame({ type: 'navigateToPage', pagePath });
        },
        navigateToAssistant: () => {
            sendToFrame({ type: 'navigateToAssistant' });
        },
        postUserMessage: (message) => sendToFrame({ type: 'postUserMessage', message }),
        configure: (settings) => {
            Object.assign(configuration, settings);
            sendToFrame({ type: 'configure', settings: configuration });
        },
        clearChat: () => sendToFrame({ type: 'clearChat' }),
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
