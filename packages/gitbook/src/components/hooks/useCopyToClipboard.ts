'use client';

import React from 'react';

/**
 * Copy text to the clipboard and expose a `copied` flag that resets after `duration`.
 * The flag is only set once the write succeeded.
 */
export function useCopyToClipboard(duration = 1000) {
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        if (!copied) {
            return;
        }
        const timeout = setTimeout(() => setCopied(false), duration);
        return () => clearTimeout(timeout);
    }, [copied, duration]);

    const copy = React.useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
        } catch {
            // Clipboard access can be denied (permissions, insecure context): don't claim success.
            setCopied(false);
        }
    }, []);

    return { copied, copy };
}
