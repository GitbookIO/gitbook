import { beforeEach, describe, expect, it, mock } from 'bun:test';

import type { FrameToParentMessage } from './protocol';

// The frame talks to the iframe over postMessage; capture the receive handler to play the frame.
let receive: (message: FrameToParentMessage) => void = () => {};
mock.module('bidc', () => ({
    createChannel: () => ({
        send: () => {},
        receive: (handler: typeof receive) => {
            receive = handler;
        },
    }),
}));

const { createGitBookFrame } = await import('./createGitBookFrame');

function createFrame() {
    return createGitBookFrame({ contentWindow: {}, allow: '' } as unknown as HTMLIFrameElement);
}

describe('createGitBookFrame.on', () => {
    beforeEach(() => {
        receive = () => {};
    });

    it('calls navigate listeners with the page the reader moved to', () => {
        const frame = createFrame();
        const events: unknown[] = [];
        frame.on('navigate', (event) => events.push(event));

        receive({
            type: 'navigate',
            tab: 'docs',
            path: '/getting-started/quickstart',
            url: 'https://example.com/docs/getting-started/quickstart',
            title: 'Quickstart',
        });

        expect(events).toEqual([
            {
                tab: 'docs',
                path: '/getting-started/quickstart',
                url: 'https://example.com/docs/getting-started/quickstart',
                title: 'Quickstart',
            },
        ]);
    });

    it('calls navigate listeners when the reader switches to another tab', () => {
        const frame = createFrame();
        const events: unknown[] = [];
        frame.on('navigate', (event) => events.push(event));

        receive({ type: 'navigate', tab: 'assistant' });

        expect(events).toEqual([{ tab: 'assistant' }]);
    });

    it('only calls the listeners of the event that was received', () => {
        const frame = createFrame();
        const calls: string[] = [];
        frame.on('close', () => calls.push('close'));
        frame.on('escape', () => calls.push('escape'));
        frame.on('navigate', () => calls.push('navigate'));

        receive({ type: 'escape' });

        expect(calls).toEqual(['escape']);
    });

    it('stops calling a listener once it is unsubscribed', () => {
        const frame = createFrame();
        const calls: string[] = [];
        const unsubscribe = frame.on('navigate', () => calls.push('navigate'));

        unsubscribe();
        receive({ type: 'navigate', tab: 'search' });

        expect(calls).toEqual([]);
    });
});
