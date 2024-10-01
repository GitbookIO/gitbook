'use client';

import React from 'react';

import { hasContentBeenUpdated } from './server-actions';

/**
 * Return a callback to check if a change request has been updated and to refresh the page if it has.
 */
export function useCheckForContentUpdate(props: {
    spaceId: string;
    changeRequestId: string;
    revisionId: string;
}) {
    const { spaceId, changeRequestId, revisionId } = props;

    return React.useCallback(async () => {
        const updated = await hasContentBeenUpdated({ spaceId, changeRequestId, revisionId });

        if (updated) {
            window.location.reload();
        }
    }, [spaceId, changeRequestId, revisionId]);
}
