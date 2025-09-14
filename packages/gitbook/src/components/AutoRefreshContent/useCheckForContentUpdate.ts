'use client';

import React from 'react';

import { hasContentBeenUpdated } from './server-actions';

/**
 * Return a callback to check if a content has been updated and to refresh the page if it has.
 */
export function useCheckForContentUpdate(props: {
    revisionId: string;
}) {
    const { revisionId } = props;

    return React.useCallback(async () => {
        const updated = await hasContentBeenUpdated({ revisionId });

        if (updated) {
            window.location.reload();
        }
    }, [revisionId]);
}
