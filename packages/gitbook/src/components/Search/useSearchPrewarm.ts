'use client';

import React from 'react';

import { prewarmPublishedSearch } from './prewarmSearch';
import { createSearchPrewarmer, type SearchPrewarmer } from './search-prewarm';

export function useSearchPrewarm(open: boolean) {
    const prewarmerRef = React.useRef<SearchPrewarmer | null>(null);
    if (prewarmerRef.current === null) {
        prewarmerRef.current = createSearchPrewarmer(open, prewarmPublishedSearch);
    }

    React.useEffect(() => {
        prewarmerRef.current?.update(open);
    }, [open]);
}
