'use client';

import { createChannel } from 'bidc';
import memoize from 'memoizee';

// oxlint-disable-next-line typescript/no-explicit-any
export function log(...data: any[]) {
    // oxlint-disable-next-line no-console
    console.log(...data);
}

/**
 * Whether a message is a bidc handshake sent by a window other than the expected one.
 */
export function isForeignHandshake(
    event: Pick<MessageEvent, 'data' | 'source'>,
    expectedSource: MessageEventSource
): boolean {
    return event.data?.type === 'bidc-connect' && event.source !== expectedSource;
}

export const getChannel = memoize(() => {
    if (typeof window === 'undefined' || window.parent === window) {
        return null;
    }
    log('[gitbook] create channel with parent window');

    // bidc accepts a handshake from any window; registered first and in capture so it runs before
    // bidc's own listener and only the embedding page can open the channel.
    window.addEventListener(
        'message',
        (event) => {
            if (isForeignHandshake(event, window.parent)) {
                event.stopImmediatePropagation();
            }
        },
        true
    );

    return createChannel();
});
