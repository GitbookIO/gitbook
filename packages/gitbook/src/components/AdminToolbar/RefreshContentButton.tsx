'use client';
import React from 'react';

import { ToolbarButton, type ToolbarButtonProps } from './Toolbar';

/**
 * Button to refresh the page if the content has been updated.
 */
export function RefreshContentButton(props: {
    refreshForUpdates: () => Promise<void>;
    motionValues?: ToolbarButtonProps['motionValues'];
}) {
    const { refreshForUpdates, motionValues } = props;

    const [loading, setLoading] = React.useState(false);

    const refresh = React.useCallback(async () => {
        setLoading(true);
        try {
            await refreshForUpdates();
        } finally {
            setLoading(false);
        }
    }, [refreshForUpdates]);

    return (
        <ToolbarButton
            title="Refresh for latest changes"
            onClick={(event) => {
                if (loading) {
                    return;
                }
                event.preventDefault();
                refresh();
            }}
            disabled={loading}
            motionValues={motionValues}
            icon="rotate"
            iconClassName={loading ? 'animate-spin' : undefined}
        />
    );
}
