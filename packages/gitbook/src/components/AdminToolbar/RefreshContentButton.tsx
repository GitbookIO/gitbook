'use client';
import React from 'react';

import { useCheckForContentUpdate } from '@/components/AutoRefreshContent';
import { tcls } from '@/lib/tailwind';

import { ToolbarButton, type ToolbarButtonProps } from './Toolbar';

// We don't show the button if the content has been updated 30s ago or less.
const minInterval = 1000 * 30;

/**
 * Button to refresh the page if the content has been updated.
 */
export function RefreshContentButton(props: {
    className?: string;

    /** ID of the revision of the content currently being displayed. */
    revisionId: string;

    /** When the content was last updated. */
    updatedAt: number;

    /** How long after content was last  */

    motionValues?: ToolbarButtonProps['motionValues'];
}) {
    const { revisionId, updatedAt, className, motionValues } = props;

    const [coolingDown, setCoolingDown] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const { refreshForUpdates, updated } = useCheckForContentUpdate({
        revisionId,
    });

    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            await refreshForUpdates();
        } finally {
            setLoading(false);
            setCoolingDown(true);
        }
    }, [refreshForUpdates]);

    // Show the button if the content has been updated more than 30s ago.
    React.useEffect(() => {
        if (updatedAt < Date.now() - minInterval) {
            setCoolingDown(false);
        }
    }, [updatedAt]);

    // 30sec after being hidden, we show the button again
    React.useEffect(() => {
        if (!coolingDown) {
            const timeout = setTimeout(() => {
                setCoolingDown(false);
            }, minInterval);
            return () => clearTimeout(timeout);
        }
    }, [coolingDown]);

    if (!updated) {
        return null;
    }

    return (
        <ToolbarButton
            title="Refresh for latest changes"
            onClick={(event) => {
                if (coolingDown) {
                    return;
                }
                event.preventDefault();
                refresh();
            }}
            className={tcls(className, 'overflow-visible')}
            disabled={loading}
            motionValues={motionValues}
            icon="rotate"
            iconClassName={loading ? 'animate-spin' : undefined}
        />
    );
}
