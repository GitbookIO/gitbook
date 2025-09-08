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
export function RefreshChangeRequestButton(props: {
    className?: string;
    spaceId: string;
    changeRequestId: string;
    revisionId: string;
    updatedAt: number;
    motionValues?: ToolbarButtonProps['motionValues'];
}) {
    const { updatedAt, className, motionValues } = props;

    const [coolingDown, setCoolingDown] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const checkForUpdates = useCheckForContentUpdate(props);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            await checkForUpdates();
        } finally {
            setLoading(false);
            setCoolingDown(true);
        }
    }, [checkForUpdates]);

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

    return (
        <ToolbarButton
            title={coolingDown ? 'Changes already refreshed recently' : 'Refresh changes'}
            onClick={(event) => {
                if (coolingDown) {
                    return;
                }
                event.preventDefault();
                refresh();
            }}
            className={tcls(className, 'overflow-visible')}
            disabled={loading || coolingDown}
            motionValues={motionValues}
            icon="rotate"
            iconClassName={tcls(loading ? 'animate-spin' : null)}
        />
    );
}
