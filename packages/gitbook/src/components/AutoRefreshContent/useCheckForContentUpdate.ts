'use client';

import React from 'react';
import { useEventCallback } from 'usehooks-ts';

import { GitBookContext } from '@/lib/gitbook-context';

import { hasContentBeenUpdated } from './server-actions';

/**
 * Return a callback to check if a change request has been updated and to refresh the page if it has.
 */
export function useCheckForContentUpdate(props: {
    ctx: GitBookContext;
    spaceId: string;
    changeRequestId: string;
    revisionId: string;
}) {
    const { ctx, spaceId, changeRequestId, revisionId } = props;
    const getCtx = useEventCallback(() => ctx);

    return React.useCallback(async () => {
        const updated = await hasContentBeenUpdated(getCtx(), {
            spaceId,
            changeRequestId,
            revisionId,
        });

        if (updated) {
            window.location.reload();
        }
    }, [spaceId, changeRequestId, revisionId, getCtx]);
}
