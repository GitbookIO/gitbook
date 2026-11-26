import { describe, expect, it } from 'bun:test';

import type { GitBookFrameClient, GitBookFrameEvents } from '../client';
import { createFrameEventRelay } from './events';

type Listeners = { [E in keyof GitBookFrameEvents]?: GitBookFrameEvents[E][] };

/** A frame client that only records listeners, so a test can emit events from the frame. */
function createFakeFrame() {
    const listeners: Listeners = {};
    const frame = {
        on: (event: keyof GitBookFrameEvents, listener: (...args: any[]) => void) => {
            (listeners[event] ??= []).push(listener);
            return () => {
                listeners[event] = listeners[event]?.filter((l) => l !== listener) as any;
            };
        },
    } as unknown as GitBookFrameClient;
    const emit = (event: keyof GitBookFrameEvents, ...args: any[]) =>
        listeners[event]?.forEach((listener) => (listener as any)(...args));
    return { frame, emit };
}

describe('createFrameEventRelay', () => {
    it('forwards events from the attached frame to listeners registered before it existed', () => {
        const relay = createFrameEventRelay();
        const events: unknown[] = [];
        relay.on('navigate', (event) => events.push(event));

        const { frame, emit } = createFakeFrame();
        relay.attach(frame);
        emit('navigate', { tab: 'search' });

        expect(events).toEqual([{ tab: 'search' }]);
    });

    it('keeps listeners when the frame is replaced, and ignores the old frame', () => {
        const relay = createFrameEventRelay();
        const events: unknown[] = [];
        relay.on('navigate', (event) => events.push(event));

        const first = createFakeFrame();
        relay.attach(first.frame);
        const second = createFakeFrame();
        relay.attach(second.frame);

        first.emit('navigate', { tab: 'search' });
        second.emit('navigate', { tab: 'assistant' });

        expect(events).toEqual([{ tab: 'assistant' }]);
    });

    it('stops calling a listener once it is unsubscribed', () => {
        const relay = createFrameEventRelay();
        const calls: string[] = [];
        const unsubscribe = relay.on('close', () => calls.push('close'));

        const { frame, emit } = createFakeFrame();
        relay.attach(frame);
        unsubscribe();
        emit('close');

        expect(calls).toEqual([]);
    });

    it('stops forwarding once detached', () => {
        const relay = createFrameEventRelay();
        const calls: string[] = [];
        relay.on('escape', () => calls.push('escape'));

        const { frame, emit } = createFakeFrame();
        relay.attach(frame);
        relay.detach();
        emit('escape');

        expect(calls).toEqual([]);
    });
});
