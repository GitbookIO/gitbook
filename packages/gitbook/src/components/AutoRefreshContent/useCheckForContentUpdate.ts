'use client';

import React from 'react';

import { checkHasContentBeenUpdated } from './server-actions';

/**
 * Return a callback to check if the content has been updated and to refresh the page if it has.
 */
export function useCheckForContentUpdate(props: {
    spaceId: string;
    changeRequestId: string;
    revisionId: string;
}) {
    const { spaceId, changeRequestId, revisionId } = props;

    return React.useCallback(async () => {
        const updated = await checkHasContentBeenUpdated({ spaceId, changeRequestId, revisionId });

        console.log('Content updated:', updated);

        if (updated) {
            window.location.reload();
        }
    }, [spaceId, changeRequestId, revisionId]);
}
