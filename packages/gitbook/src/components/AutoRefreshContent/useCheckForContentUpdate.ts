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
    const [updated, setUpdated] = React.useState(false);

    const checkForUpdates = React.useCallback(async () => {
        if (updated) {
            // No need to check for updates if we already know the content has been updated
            return true;
        }

        const result = await hasContentBeenUpdated({ revisionId });
        setUpdated(result);
        return result;
    }, [revisionId, updated]);

    const refreshForUpdates = React.useCallback(async () => {
        if (await checkForUpdates()) {
            window.location.reload();
        }
    }, [checkForUpdates]);

    // Check for updates when the tab is becoming visible
    React.useEffect(() => {
        if (updated) {
            // No need to check for updates if we already know the content has been updated
            return;
        }

        const callback = () => {
            if (document.visibilityState === 'visible') {
                checkForUpdates();
            }
        };

        document.addEventListener('visibilitychange', callback);
        return () => {
            document.removeEventListener('visibilitychange', callback);
        };
    }, [checkForUpdates, updated]);

    return { refreshForUpdates, updated };
}
