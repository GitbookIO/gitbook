'use client';

import React from 'react';

import { createSearchPrewarmer, type SearchPrewarmer } from './search-prewarm';

export function useSearchPrewarm(open: boolean, prewarmURL: string) {
    const prewarmerRef = React.useRef<SearchPrewarmer | null>(null);
    if (prewarmerRef.current === null) {
        prewarmerRef.current = createSearchPrewarmer(open);
    }

    React.useEffect(() => {
        prewarmerRef.current?.update(open, async () => {
            const response = await fetch(prewarmURL, { method: 'POST' });
            if (!response.ok) {
                throw new Error(`Search prewarm request failed: ${response.status}`);
            }
        });
    }, [open, prewarmURL]);
}
