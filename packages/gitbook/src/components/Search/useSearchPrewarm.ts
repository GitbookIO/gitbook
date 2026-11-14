'use client';

import React from 'react';

import type { SearchPassStore } from './search-pass-store';
import { createSearchPrewarmer, type SearchPrewarmer } from './search-prewarm';

export function useSearchPrewarm(open: boolean, passStore: SearchPassStore) {
    const prewarmer = React.useMemo<SearchPrewarmer>(
        () => createSearchPrewarmer(false),
        [passStore]
    );

    React.useEffect(() => {
        prewarmer.update(open, () => passStore.warmUp());
    }, [open, passStore, prewarmer]);

    React.useEffect(() => {
        passStore.setOpen(open);
        return () => passStore.setOpen(false);
    }, [open, passStore]);
}
