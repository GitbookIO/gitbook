import { createChannel } from 'bidc';
import type {
    FrameToParentMessage,
    GitBookEmbeddableConfiguration,
    ParentToFrameMessage,
} from './protocol';

export type GitBookFrameClient = {
    /**
     * Navigate to a page in the docs tab.
     *
     * Provide the page's path relative to the root of your docs
     * (e.g. `getting-started/quickstart`), or its full published URL
     * (e.g. `https://example.com/docs/getting-started/quickstart`).
     *
     * If your docs are served from a subdirectory (e.g. `example.com/docs`), the
     * path must be relative to the docs root — omit the subdirectory
     * (`getting-started/quickstart`, not `/docs/getting-started/quickstart`) — or
     * pass the full URL.
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

    const allowTokens = iframe.allow
        .split(';')
        .map((token) => token.trim())
        .filter(Boolean);

    if (!allowTokens.includes('clipboard-write')) {
        iframe.allow = [...allowTokens, 'clipboard-write'].join('; ');
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
        tabs: ['assistant', 'search', 'docs'],
        actions: [],
        greeting: { title: '', subtitle: '' },
        suggestions: [],
        tools: [],
        trademark: true,
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
