'use client';

import { createChannel } from 'bidc';
import memoize from 'memoizee';

// oxlint-disable-next-line typescript/no-explicit-any
export function log(...data: any[]) {
    // oxlint-disable-next-line no-console
    console.log(...data);
}

export const getChannel = memoize(() => {
    if (typeof window === 'undefined' || window.parent === window) {
        return null;
    }
    log('[gitbook] create channel with parent window');

    return createChannel();
});
