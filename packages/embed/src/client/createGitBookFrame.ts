import { createChannel } from 'bidc';

import type {
    FrameToParentMessage,
    GitBookEmbeddableConfiguration,
    GitBookFrameEvents,
    ParentToFrameMessage,
} from './protocol';

export type GitBookFrameClient = {
    /**
     * Navigate to a page in the docs tab.
     *
     * Accepts the page's path within the site (e.g. `getting-started/quickstart`),
     * an absolute path (e.g. `/help-center/integrations`), or its full published URL.
     * The target page may live in any space/section of the site — including one other
     * than the embed is currently showing — and is resolved to the right space.
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
     * Register an event listener and get back a function that removes it.
     *
     * - `close`: the built-in close button was clicked.
     * - `escape`: Escape was pressed inside the frame and nothing in it (a menu, a dialog) used it.
     * - `navigate`: the reader opened a page in the docs tab, or switched to another tab.
     */
    on<E extends keyof GitBookFrameEvents>(event: E, listener: GitBookFrameEvents[E]): () => void;
    // Kept so callers typed against the earlier `string` signature still compile.
    on(event: string, listener: (...args: any[]) => void): () => void;
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
        switch (message.type) {
            case 'close':
            case 'escape':
                emit(message.type);
                break;
            case 'navigate': {
                const { type: _type, ...event } = message;
                emit('navigate', event);
                break;
            }
        }
    });

    const sendToFrame = (message: ParentToFrameMessage) => {
        console.log('[gitbook:embed] send message', message);
        channel.send(message);
    };

    const events = new Map<string, ((...args: any[]) => void)[]>();
    const emit = <E extends keyof GitBookFrameEvents>(
        event: E,
        ...args: Parameters<GitBookFrameEvents[E]>
    ) => {
        (events.get(event) || []).forEach((listener) => listener(...args));
    };

    const configuration: GitBookEmbeddableConfiguration = {
        tabs: ['assistant', 'search', 'docs'],
        actions: [],
        greeting: { title: '', subtitle: '' },
        suggestions: undefined,
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
        on: (event: string, listener: (...args: any[]) => void) => {
            const listeners = events.get(event) || [];
            listeners.push(listener);
            events.set(event, listeners);
            return () => {
                events.set(
                    event,
                    (events.get(event) || []).filter((l) => l !== listener)
                );
            };
        },
    };
}
