'use client';
import { Icon } from '@gitbook/icons';
import React from 'react';

import { useCheckForContentUpdate } from '@/components/AutoRefreshContent';
import { tcls } from '@/lib/tailwind';

import { ToolbarButton } from './Toolbar';

// We don't show the button if the content has been updated 30s ago or less.
const minInterval = 1000 * 30; // 5 minutes

/**
 * Button to refresh the page if the content has been updated.
 */
export function RefreshChangeRequestButton(props: {
    spaceId: string;
    changeRequestId: string;
    revisionId: string;
    updatedAt: number;
}) {
    const { updatedAt } = props;

    const [visible, setVisible] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const checkForUpdates = useCheckForContentUpdate(props);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            await checkForUpdates();
        } finally {
            setLoading(false);
            setVisible(false);
        }
    }, [checkForUpdates]);

    // Show the button if the content has been updated more than 30s ago.
    React.useEffect(() => {
        if (updatedAt < Date.now() - minInterval) {
            setVisible(true);
        }
    }, [updatedAt]);

    // 30sec after being hidden, we show the button again
    React.useEffect(() => {
        if (!visible) {
            const timeout = setTimeout(() => {
                setVisible(true);
            }, minInterval);
            return () => clearTimeout(timeout);
        }
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <ToolbarButton
            title="Refresh"
            onClick={(event) => {
                event.preventDefault();
                refresh();
            }}
        >
            <Icon icon="rotate" className={tcls('size-4', loading ? 'animate-spin' : null)} />
        </ToolbarButton>
    );
}
