'use client';

import { createChannel } from 'bidc';
import memoize from 'memoizee';

// biome-ignore lint/suspicious/noExplicitAny: expected
export function log(...data: any[]) {
    // biome-ignore lint/suspicious/noConsole: expected
    console.log(...data);
}

export const getChannel = memoize(() => {
    if (typeof window === 'undefined' || window.parent === window) {
        return null;
    }
    log('[gitbook] create channel with parent window');

    return createChannel();
});
