'use client';
import { Icon } from '@gitbook/icons';
import React from 'react';

import { useCheckForContentUpdate } from '@/components/AutoRefreshContent';
import { tcls } from '@/lib/tailwind';

import { ToolbarButton } from './Toolbar';

/**
 * Button to refresh the page if the content has been updated.
 */
export function RefreshChangeRequestButton(props: {
    spaceId: string;
    changeRequestId: string;
    revisionId: string;
}) {
    const [loading, setLoading] = React.useState(false);
    const checkForUpdates = useCheckForContentUpdate(props);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            await checkForUpdates();
        } finally {
            setLoading(false);
        }
    }, [checkForUpdates]);

    React.useEffect(() => {}, [refresh]);

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
