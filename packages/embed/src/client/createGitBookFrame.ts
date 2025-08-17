import { createChannel } from 'bidc';
import type { CreateGitBookOptions } from './createGitBook';

export type GitBookFrameClient = {
    /**
     * Post a message to the chat.
     */
    postUserMessage: (message: string) => void;

    /**
     * Register a custom tool.
     */
    registerTool: (tool: {}) => void;
};

export function createGitBookFrame(
    iframe: HTMLIFrameElement,
    options: CreateGitBookOptions
): GitBookFrameClient {
    const channel = createChannel(iframe.contentWindow);

    // TODO: Implement the client.
}
